export const prerender = false;
import type { APIRoute } from 'astro';
import { apiBase, bcRequest, cardFrom, loadCardCache, loadOverlay, saveOverlay } from '../../../lib/nanban/basecamp';
import { badRequest, handle } from '../../../lib/nanban/api';

export const POST: APIRoute = async ({ request }) => {
  let projectId: number, todolistId: number, title: string, description: string;
  let assigneeIds: number[] | undefined;
  try {
    const b = await request.json();
    projectId = b.project_id;
    todolistId = b.todolist_id;
    title = b.title;
    description = b.description ?? '';
    if (Array.isArray(b.assignee_ids)) assigneeIds = b.assignee_ids;
    if (projectId == null || todolistId == null || title == null) return badRequest();
  } catch {
    return badRequest();
  }

  return handle(async () => {
    const url = `${apiBase()}/buckets/${projectId}/todolists/${todolistId}/todos.json`;
    const payload: Record<string, unknown> = { content: title, description };
    if (assigneeIds) payload.assignee_ids = assigneeIds;
    const created = await (await bcRequest('POST', url, payload)).json();

    const tid = String(created.id);
    const [overlay, cache] = await Promise.all([loadOverlay(), loadCardCache()]);
    const positions = Object.entries(overlay)
      .filter(([k, e]) => k !== '_meta' && e.column === 'To Do')
      .map(([, e]) => e.position ?? 0);
    const pos = positions.length ? Math.max(...positions) + 1 : 0;
    const card = cardFrom({
      id: created.id,
      title: created.title || created.content || title,
      description: created.description ?? description,
      due_on: created.due_on ?? null,
      assignees: (created.assignees ?? []).map((a: any) => a.name),
      project_id: projectId,
      project_name: cache.projNames[String(projectId)] ?? '',
      todolist_id: todolistId,
      todolist_name: cache.listNames[String(todolistId)] ?? '',
      url: created.app_url ?? null,
      column: 'To Do',
      position: pos,
    });
    overlay[tid] = { column: 'To Do', position: pos, card };
    await saveOverlay(overlay);
    return { ok: true, card };
  });
};
