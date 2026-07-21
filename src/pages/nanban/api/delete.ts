export const prerender = false;
import type { APIRoute } from 'astro';
import { bcRequest, loadOverlay, saveOverlay } from '../../../lib/nanban/basecamp';
import { badRequest, handle } from '../../../lib/nanban/api';

export const POST: APIRoute = async ({ request }) => {
  let todoId: string, projectId: number;
  try {
    const b = await request.json();
    todoId = String(b.todo_id);
    projectId = b.project_id;
    if (b.todo_id == null || projectId == null) return badRequest();
  } catch {
    return badRequest();
  }

  return handle(async () => {
    // Trash in Basecamp (recoverable for 30 days), then drop the overlay entry.
    const url = `${apiBase()}/buckets/${projectId}/recordings/${todoId}/status/trashed.json`;
    await bcRequest('PUT', url, {});
    const overlay = await loadOverlay();
    delete overlay[todoId];
    await saveOverlay(overlay);
    return { ok: true };
  });
};
