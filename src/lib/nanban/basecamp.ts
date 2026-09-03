// Port of Nanban's server.py Basecamp layer. State lives in Upstash Redis:
import { env } from './env';
//   nanban:board     — overlay { [todo_id]: {column, position, card?}, _meta: {project_order} }
//   nanban:tokens    — { access_token, refresh_token, ... }
//   nanban:cardcache — { cards: {[id]: Card}, projNames, listNames }
// ponytail: no locking — single user, last-write-wins (matches the migration plan).
import { kvGet, kvSet } from './redis';

export const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Blocked', 'Done'];
const DONE_CAP = 30;
const USER_AGENT = 'Nanban (nep@joinforma.com)';

export const apiBase = () => `https://3.basecampapi.com/${env('BASECAMP_ACCOUNT_ID')}`;

export interface Card {
  id: number;
  title: string;
  description: string;
  due_on: string | null;
  assignees: string[];
  project_id: number;
  project_name: string;
  todolist_id: number;
  todolist_name: string;
  column: string;
  position: number;
  url: string | null;
}

type Tray = { name?: string; ids: string[] };
export type OverlayEntry = { column?: string; position?: number; card?: Card };
type Overlay = {
  _meta?: { project_order?: string[]; trays?: Record<string, Tray> };
} & Record<string, OverlayEntry>;

/** Card entries of the overlay, i.e. everything except the `_meta` record. */
export const cardEntries = (o: Overlay): [string, OverlayEntry][] =>
  Object.entries(o).filter(([k]) => k !== '_meta') as [string, OverlayEntry][];
type CardCache = {
  cards: Record<string, Card>;
  projNames: Record<string, string>;
  listNames: Record<string, string>;
  people?: Record<string, { id: number; name: string }[]>;
};

export const loadOverlay = async (): Promise<Overlay> =>
  (await kvGet<Overlay>('nanban:board')) ?? {};
export const saveOverlay = (o: Overlay) => kvSet('nanban:board', o);
export const loadCardCache = async (): Promise<CardCache> =>
  (await kvGet<CardCache>('nanban:cardcache')) ?? { cards: {}, projNames: {}, listNames: {} };

export class BasecampError extends Error {
  constructor(public status: number) {
    super(`basecamp ${status}`);
  }
}

// --- tokens -----------------------------------------------------------------
type Tokens = { access_token: string; refresh_token: string } & Record<string, unknown>;
let cachedAccessToken: string | null = null; // per-instance; refreshed state is in Redis

async function accessToken(): Promise<string> {
  if (!cachedAccessToken) {
    const t = await kvGet<Tokens>('nanban:tokens');
    if (!t) throw new Error('nanban:tokens missing in Redis');
    cachedAccessToken = t.access_token;
  }
  return cachedAccessToken;
}

async function refreshAccessToken(): Promise<string> {
  const t = await kvGet<Tokens>('nanban:tokens');
  if (!t) throw new Error('nanban:tokens missing in Redis');
  if (cachedAccessToken && t.access_token !== cachedAccessToken) {
    // Another invocation already refreshed — reuse its token.
    cachedAccessToken = t.access_token;
    return t.access_token;
  }
  const params = new URLSearchParams({
    type: 'refresh',
    refresh_token: t.refresh_token,
    client_id: env('BASECAMP_CLIENT_ID'),
    client_secret: env('BASECAMP_CLIENT_SECRET'),
    redirect_uri: env('BASECAMP_REDIRECT_URI'),
  });
  const res = await fetch(`https://launchpad.37signals.com/authorization/token?${params}`, {
    method: 'POST',
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`token refresh failed: ${res.status}`);
  const body = (await res.json()) as { access_token: string };
  await kvSet('nanban:tokens', { ...t, access_token: body.access_token });
  cachedAccessToken = body.access_token;
  return body.access_token;
}

// --- requests ---------------------------------------------------------------
export async function bcRequest(
  method: string,
  url: string,
  body?: unknown,
  retried = false,
): Promise<Response> {
  const headers: Record<string, string> = {
    'User-Agent': USER_AGENT,
    Authorization: `Bearer ${await accessToken()}`,
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && !retried) {
    await refreshAccessToken();
    return bcRequest(method, url, body, true);
  }
  if (res.status === 429 && !retried) {
    const wait = Number(res.headers.get('Retry-After') || '1') || 1;
    await new Promise((r) => setTimeout(r, wait * 1000));
    return bcRequest(method, url, body, true);
  }
  if (!res.ok) throw new BasecampError(res.status);
  return res;
}

async function bcGetPaginated(url: string): Promise<any[]> {
  const items: any[] = [];
  let next: string | null = url;
  while (next) {
    const res = await bcRequest('GET', next);
    items.push(...((await res.json()) as any[]));
    next = null;
    for (const part of (res.headers.get('Link') ?? '').split(',')) {
      if (part.includes('rel="next"')) {
        next = part.split(';')[0].trim().replace(/^<|>$/g, '');
      }
    }
  }
  return items;
}

// --- basecamp data fetch ----------------------------------------------------
async function fetchProjects() {
  const out: { id: number; name: string; todoset_id: number }[] = [];
  for (const p of await bcGetPaginated(`${apiBase()}/projects.json`)) {
    const todoset = (p.dock ?? []).find((d: any) => d.name === 'todoset' && d.enabled);
    if (todoset) out.push({ id: p.id, name: p.name, todoset_id: todoset.id });
  }
  return out;
}

async function fetchTodolists(project: { id: number; todoset_id: number }) {
  const url = `${apiBase()}/buckets/${project.id}/todosets/${project.todoset_id}/todolists.json`;
  return (await bcGetPaginated(url)).map((t) => ({ id: t.id, title: t.title }));
}

// People assignable on a project. Try the projects path first; some accounts only
// expose it under buckets — fall back to that on a 404.
async function fetchPeople(projectId: number): Promise<{ id: number; name: string }[]> {
  let raw: any[];
  try {
    raw = await bcGetPaginated(`${apiBase()}/projects/${projectId}/people.json`);
  } catch (e) {
    if (e instanceof BasecampError && e.status === 404) {
      raw = await bcGetPaginated(`${apiBase()}/buckets/${projectId}/people.json`);
    } else {
      throw e;
    }
  }
  return raw.map((p) => ({ id: p.id, name: p.name }));
}

async function fetchTodos(projectId: number, todolist: { id: number; title: string }) {
  const url = `${apiBase()}/buckets/${projectId}/todolists/${todolist.id}/todos.json`;
  return (await bcGetPaginated(url)).map((t) => ({
    id: t.id,
    title: t.title || t.content || '',
    description: t.description ?? '',
    due_on: t.due_on ?? null,
    assignees: (t.assignees ?? []).map((a: any) => a.name),
    project_id: projectId,
    todolist_id: todolist.id,
    todolist_name: todolist.title,
    url: t.app_url ?? null,
  }));
}

export const completeUrl = (projectId: number | string, todoId: number | string) =>
  `${apiBase()}/buckets/${projectId}/todos/${todoId}/completion.json`;

export const commentFrom = (c: any) => ({
  author: c.creator?.name ?? '',
  created_at: c.created_at,
  content: c.content ?? '',
});

export function textToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r\n|\n/g, '<br>');
}

export async function createComment(
  projectId: string | number,
  todoId: string | number,
  text: string,
) {
  const res = await bcRequest(
    'POST',
    `${apiBase()}/buckets/${projectId}/recordings/${todoId}/comments.json`,
    { content: textToHtml(text) },
  );
  return commentFrom(await res.json());
}

export async function fetchCardDetail(projectId: string, todoId: string) {
  const t = await (await bcRequest('GET', `${apiBase()}/buckets/${projectId}/todos/${todoId}.json`)).json();
  let comments: { author: string; created_at: string; content: string }[] = [];
  if (t.comments_count) {
    const curl = `${apiBase()}/buckets/${projectId}/recordings/${todoId}/comments.json`;
    comments = (await bcGetPaginated(curl)).map(commentFrom);
  }
  return {
    id: t.id,
    title: t.title || t.content || '',
    description: t.description ?? '',
    due_on: t.due_on ?? null,
    assignees: (t.assignees ?? []).map((a: any) => a.name),
    completed: t.completed ?? false,
    url: t.app_url ?? null,
    comments,
  };
}

export function cardFrom(t: any): Card {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    due_on: t.due_on ?? null,
    assignees: t.assignees ?? [],
    project_id: t.project_id,
    project_name: t.project_name ?? '',
    todolist_id: t.todolist_id,
    todolist_name: t.todolist_name ?? '',
    column: t.column ?? 'Backlog',
    position: t.position ?? 0,
    url: t.url ?? null,
  };
}

export function reindex(overlay: Overlay, column: string) {
  const entries = cardEntries(overlay).filter(([, e]) => e.column === column);
  entries.sort((a, b) => (a[1].position ?? 0) - (b[1].position ?? 0));
  entries.forEach(([, e], i) => (e.position = i));
}

// --- board build ------------------------------------------------------------
export async function buildBoard() {
  const projects = await fetchProjects();
  const listsByProj = new Map(
    await Promise.all(
      projects.map(async (p) => [p.id, await fetchTodolists(p)] as const),
    ),
  );
  const peopleByProj = new Map(
    await Promise.all(
      projects.map(async (p) => [p.id, await fetchPeople(p.id)] as const),
    ),
  );
  const pairs = projects.flatMap((p) =>
    (listsByProj.get(p.id) ?? []).map((tl) => ({ projectId: p.id, tl })),
  );
  const todoResults = await Promise.all(pairs.map((pr) => fetchTodos(pr.projectId, pr.tl)));

  const projName = new Map(projects.map((p) => [p.id, p.name]));
  let cards: any[] = todoResults.flat().map((t) => ({
    ...t,
    project_name: projName.get(t.project_id) ?? '',
  }));

  const overlay = await loadOverlay();
  const openIds = new Set(cards.map((c) => String(c.id)));

  // Prune overlay entries whose todo is gone, except Done (cached snapshots).
  for (const tid of Object.keys(overlay)) {
    if (tid === '_meta') continue;
    if (!openIds.has(tid) && overlay[tid].column !== 'Done') delete overlay[tid];
  }
  // Add Done cached cards no longer in the open fetch.
  for (const [tid, entry] of Object.entries(overlay)) {
    if (tid === '_meta') continue;
    const e = entry as OverlayEntry;
    if (e.column === 'Done' && !openIds.has(tid) && e.card) cards.push({ ...e.card });
  }
  await saveOverlay(overlay);

  // Assign column/position from overlay; unknowns -> Backlog appended.
  for (const c of cards) {
    const entry = overlay[String(c.id)] as OverlayEntry | undefined;
    if (entry) {
      c.column = entry.column ?? 'Backlog';
      c.position = entry.position ?? 0;
    } else {
      c.column = 'Backlog';
      c.position = null;
    }
  }
  const byCol = new Map<string, any[]>();
  for (const c of cards) {
    if (!byCol.has(c.column)) byCol.set(c.column, []);
    byCol.get(c.column)!.push(c);
  }
  for (const group of byCol.values()) {
    let n = Math.max(-1, ...group.filter((c) => c.position !== null).map((c) => c.position)) + 1;
    for (const c of group) if (c.position === null) c.position = n++;
  }

  // Cap Done at the 30 most recent (highest position).
  const done = [...(byCol.get('Done') ?? [])].sort((a, b) => b.position - a.position);
  const keepDone = new Set(done.slice(0, DONE_CAP));
  cards = cards.filter((c) => c.column !== 'Done' || keepDone.has(c));

  // Prune tray ids whose card is no longer on the board (final card set).
  const boardIds = new Set(cards.map((c) => String(c.id)));
  const trays = overlay._meta?.trays;
  if (trays) {
    let changed = false;
    for (const tray of Object.values(trays)) {
      const kept = tray.ids.filter((id) => boardIds.has(id));
      if (kept.length !== tray.ids.length) {
        tray.ids = kept;
        changed = true;
      }
    }
    if (changed) await saveOverlay(overlay);
  }

  const people = Object.fromEntries(
    projects.map((p) => [String(p.id), peopleByProj.get(p.id) ?? []]),
  );
  const cache: CardCache = {
    cards: Object.fromEntries(cards.map((c) => [String(c.id), cardFrom(c)])),
    projNames: Object.fromEntries(projects.map((p) => [String(p.id), p.name])),
    listNames: Object.fromEntries(
      [...listsByProj.values()].flat().map((tl) => [String(tl.id), tl.title]),
    ),
    people,
  };
  await kvSet('nanban:cardcache', cache);

  return {
    columns: COLUMNS,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      todolists: listsByProj.get(p.id) ?? [],
    })),
    cards,
    project_order: overlay._meta?.project_order ?? [],
    people,
    trays: overlay._meta?.trays ?? {},
  };
}
