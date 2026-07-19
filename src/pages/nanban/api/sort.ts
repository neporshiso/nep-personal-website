export const prerender = false;
import type { APIRoute } from 'astro';
import { COLUMNS, loadOverlay, saveOverlay } from '../../../lib/nanban/basecamp';
import { badRequest, handle, json } from '../../../lib/nanban/api';

export const POST: APIRoute = async ({ request }) => {
  let column: string, ids: string[];
  try {
    const b = await request.json();
    column = b.column;
    ids = (b.ids as unknown[]).map(String);
  } catch {
    return badRequest();
  }
  if (!COLUMNS.includes(column)) return json({ error: 'unknown column' }, 400);

  return handle(async () => {
    const overlay = await loadOverlay();
    ids.forEach((tid, i) => {
      overlay[tid] = { ...overlay[tid], column, position: i };
    });
    await saveOverlay(overlay);
    return { ok: true };
  });
};
