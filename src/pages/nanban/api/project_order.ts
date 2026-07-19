export const prerender = false;
import type { APIRoute } from 'astro';
import { loadOverlay, saveOverlay } from '../../../lib/nanban/basecamp';
import { badRequest, handle } from '../../../lib/nanban/api';

export const POST: APIRoute = async ({ request }) => {
  let order: string[];
  try {
    const b = await request.json();
    order = (b.order as unknown[]).map(String);
  } catch {
    return badRequest();
  }

  return handle(async () => {
    const overlay = await loadOverlay();
    overlay._meta = { ...overlay._meta, project_order: order };
    await saveOverlay(overlay);
    return { ok: true };
  });
};
