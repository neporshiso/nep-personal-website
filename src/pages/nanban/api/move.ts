export const prerender = false;
import type { APIRoute } from 'astro';
import {
  COLUMNS,
  bcRequest,
  completeUrl,
  loadCardCache,
  loadOverlay,
  reindex,
  saveOverlay,
} from '../../../lib/nanban/basecamp';
import { badRequest, handle, json } from '../../../lib/nanban/api';

export const POST: APIRoute = async ({ request }) => {
  let todoId: string, projectId: number, column: string, position: number;
  try {
    const b = await request.json();
    todoId = String(b.todo_id);
    projectId = b.project_id;
    column = b.column;
    position = Number(b.position);
    if (b.todo_id == null || projectId == null || Number.isNaN(position)) return badRequest();
  } catch {
    return badRequest();
  }
  if (!COLUMNS.includes(column)) return json({ error: 'unknown column' }, 400);

  return handle(async () => {
    const overlay = await loadOverlay();
    const entry = overlay[todoId] ?? {};
    const oldCol = entry.column ?? 'Backlog';

    // Basecamp completion side-effects (before persisting overlay).
    if (column === 'Done' && oldCol !== 'Done') {
      await bcRequest('POST', completeUrl(projectId, todoId), {});
    } else if (oldCol === 'Done' && column !== 'Done') {
      await bcRequest('DELETE', completeUrl(projectId, todoId));
    }

    entry.column = column;
    entry.position = position - 0.5; // slot in, then reindex
    if (column === 'Done') {
      // Snapshot the card so it survives dropping out of the open-todos fetch.
      const snap = (await loadCardCache()).cards[todoId];
      if (snap) entry.card = { ...snap, column: 'Done' };
    } else {
      delete entry.card;
    }
    overlay[todoId] = entry;
    reindex(overlay, column);
    if (oldCol !== column) reindex(overlay, oldCol);
    await saveOverlay(overlay);
    return { ok: true };
  });
};
