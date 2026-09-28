// Unit tests for cardEntries, the single place where the overlay's `_meta`/card
// distinction is made.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as updatePOST } from '../../pages/nanban/api/update';
import {
  buildBoard,
  cardEntries,
  createComment,
  isEffort,
  pruneEffort,
  setEffort,
  textToHtml,
} from './basecamp';

// Basecamp calls go through bcRequest, which needs a token from Redis and the
// account id from env; stub both so tests only exercise the outgoing request.
// `redisStore` holds every other key (the overlay), and `kvSet` writes to it.
const redisStore: Record<string, unknown> = {};
vi.mock('./redis', () => ({
  kvGet: async (key: string) =>
    key === 'nanban:tokens' ? { access_token: 'tok', refresh_token: 'ref' } : (redisStore[key] ?? null),
  kvSet: async (key: string, value: unknown) => {
    redisStore[key] = structuredClone(value);
  },
}));

describe('cardEntries', () => {
  it('excludes the _meta key', () => {
    const overlay = {
      _meta: { project_order: ['a'] },
      a: { column: 'To Do', position: 0 },
    };
    const keys = cardEntries(overlay).map(([k]) => k);
    expect(keys).not.toContain('_meta');
  });

  it('returns every other key with its exact entry object, preserving insertion order', () => {
    const entryA = { column: 'To Do', position: 0 };
    const entryB = { column: 'Done', position: 1 };
    const overlay = { a: entryA, b: entryB };
    expect(cardEntries(overlay)).toEqual([
      ['a', entryA],
      ['b', entryB],
    ]);
  });

  it('returns [] for {}', () => {
    expect(cardEntries({})).toEqual([]);
  });

  it("returns [] for { _meta: { project_order: ['x'] } }", () => {
    const overlay = { _meta: { project_order: ['x'] } };
    expect(cardEntries(overlay)).toEqual([]);
  });
});

describe('textToHtml', () => {
  it('escapes HTML-significant characters', () => {
    expect(textToHtml('<b>&"')).toBe('&lt;b&gt;&amp;&quot;');
  });

  it('converts newlines to line breaks', () => {
    expect(textToHtml('a\nb')).toBe('a<br>b');
  });
});

describe('createComment', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('POSTs escaped HTML content to the recording comments endpoint and maps the reply', async () => {
    vi.stubEnv('BASECAMP_ACCOUNT_ID', '42');
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 201,
      headers: new Headers(),
      json: async () => ({
        creator: { name: 'Nep Orshiso' },
        created_at: '2026-09-03T12:00:00Z',
        content: '&lt;script&gt;',
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const comment = await createComment(7, 9, '<script>\nhi');

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://3.basecampapi.com/42/buckets/7/recordings/9/comments.json');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ content: '&lt;script&gt;<br>hi' });
    expect(comment).toEqual({
      author: 'Nep Orshiso',
      created_at: '2026-09-03T12:00:00Z',
      content: '&lt;script&gt;',
    });
  });
});

describe('effort storage', () => {
  it('accepts only 1, 2 and 3', () => {
    for (const v of [1, 2, 3]) expect(isEffort(v)).toBe(true);
    for (const v of [null, undefined, 0, 4, '2', 2.5]) expect(isEffort(v)).toBe(false);
  });

  it('setEffort creates _meta and _meta.effort on an overlay that has neither', () => {
    const overlay: any = {};
    setEffort(overlay, '5', 3);
    expect(overlay._meta.effort).toEqual({ '5': 3 });
  });

  it('setEffort keeps the other _meta keys', () => {
    const overlay: any = { _meta: { project_order: ['a'] } };
    setEffort(overlay, '5', 1);
    expect(overlay._meta).toEqual({ project_order: ['a'], effort: { '5': 1 } });
  });

  it('pruneEffort drops overrides for cards no longer on the board', () => {
    const overlay: any = { _meta: { effort: { '1': 2, '2': 3 } } };
    expect(pruneEffort(overlay, new Set(['1']))).toBe(true);
    expect(overlay._meta.effort).toEqual({ '1': 2 });
    expect(pruneEffort(overlay, new Set(['1']))).toBe(false);
  });

  it('pruneEffort is a no-op when nothing was ever stored', () => {
    expect(pruneEffort({}, new Set())).toBe(false);
    expect(pruneEffort({ _meta: { project_order: [] } } as any, new Set())).toBe(false);
  });
});

describe('POST /nanban/api/update — effort', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    for (const k of Object.keys(redisStore)) delete redisStore[k];
    vi.stubEnv('BASECAMP_ACCOUNT_ID', '42');
    fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ title: 'T', description: '', due_on: null, assignees: [] }),
    }));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const call = (body: unknown) =>
    (updatePOST as unknown as (ctx: { request: Request }) => Promise<Response>)({
      request: new Request('http://x/nanban/api/update', { method: 'POST', body: JSON.stringify(body) }),
    });
  const base = { todo_id: 7, project_id: 9, title: 'T' };

  for (const effort of [null, 0, 4, '2', 2.5]) {
    it(`rejects effort ${JSON.stringify(effort)} with 400 before calling Basecamp`, async () => {
      const res = await call({ ...base, effort });
      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(redisStore['nanban:board']).toBeUndefined();
    });
  }

  it('stores effort when the overlay has no _meta yet, and echoes it', async () => {
    const res = await call({ ...base, effort: 2 });
    expect(res.status).toBe(200);
    expect((await res.json()).effort).toBe(2);
    expect((redisStore['nanban:board'] as any)._meta.effort).toEqual({ '7': 2 });
  });

  it('changes an existing effort', async () => {
    redisStore['nanban:board'] = { _meta: { effort: { '7': 1 } } };
    await call({ ...base, effort: 3 });
    expect((redisStore['nanban:board'] as any)._meta.effort).toEqual({ '7': 3 });
  });

  it('leaves effort alone when the request omits it, and echoes null for a card without one', async () => {
    redisStore['nanban:board'] = { _meta: { effort: { '8': 1 } } };
    const res = await call(base);
    expect((await res.json()).effort).toBeNull();
    expect((redisStore['nanban:board'] as any)._meta.effort).toEqual({ '8': 1 });
  });
});

describe('buildBoard — effort', () => {
  beforeEach(() => {
    for (const k of Object.keys(redisStore)) delete redisStore[k];
    vi.stubEnv('BASECAMP_ACCOUNT_ID', '42');
    // One project, one list, one open todo (id 1). Everything else is empty.
    const bodyFor = (url: string): unknown => {
      if (url.endsWith('/projects.json'))
        return [{ id: 9, name: 'P', dock: [{ name: 'todoset', enabled: true, id: 5 }] }];
      if (url.endsWith('/todosets/5/todolists.json')) return [{ id: 7, title: 'Home' }];
      if (url.endsWith('/todolists/7/todos.json')) return [{ id: 1, title: 'Open card' }];
      return [];
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => bodyFor(url),
      })),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('prunes a gone card\'s effort from Redis and returns the rest', async () => {
    redisStore['nanban:board'] = { _meta: { effort: { '1': 3, '2': 1 } } };
    const board = await buildBoard();
    expect(board.effort).toEqual({ '1': 3 });
    expect((redisStore['nanban:board'] as any)._meta.effort).toEqual({ '1': 3 });
  });

  it('returns an empty effort map when Redis never stored one', async () => {
    const board = await buildBoard();
    expect(board.effort).toEqual({});
  });
});
