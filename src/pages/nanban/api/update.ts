export const prerender = false;
import type { APIRoute } from 'astro';
import { bcRequest, loadOverlay, saveOverlay } from '../../../lib/nanban/basecamp';
import { badRequest, handle, json } from '../../../lib/nanban/api';

export const POST: APIRoute = async ({ request }) => {
  let todoId: string, projectId: number, title: string, body: any;
  try {
    body = await request.json();
    todoId = String(body.todo_id);
    projectId = body.project_id;
    title = String(body.title ?? '').trim();
    if (body.todo_id == null || projectId == null) return badRequest();
  } catch {
    return badRequest();
  }
  if (!title) return json({ error: 'title required' }, 400);

  return handle(async () => {
    const payload: Record<string, unknown> = {
      content: title,
      description: body.description ?? '',
      // empty string clears the date in Basecamp
      due_on: body.due_on || '',
    };
    if (Array.isArray(body.assignee_ids)) payload.assignee_ids = body.assignee_ids;
    const url = `https://3.basecampapi.com/${process.env.BASECAMP_ACCOUNT_ID}/buckets/${projectId}/todos/${todoId}.json`;
    const updated = await (await bcRequest('PUT', url, payload)).json();

    // Refresh the Done snapshot if this card is cached there.
    const assignees = (updated.assignees ?? []).map((a: any) => a.name);
    const overlay = await loadOverlay();
    const entry = overlay[todoId];
    if (entry?.card) {
      entry.card.title = updated.title || title;
      entry.card.description = updated.description ?? String(payload.description);
      entry.card.due_on = updated.due_on ?? null;
      if (Array.isArray(body.assignee_ids)) entry.card.assignees = assignees;
      await saveOverlay(overlay);
    }
    return {
      ok: true,
      title: updated.title || title,
      description: updated.description ?? payload.description,
      due_on: updated.due_on ?? null,
      assignees,
    };
  });
};
