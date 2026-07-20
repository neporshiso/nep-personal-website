export const prerender = false;
import type { APIRoute } from 'astro';
import { loadOverlay, saveOverlay } from '../../../lib/nanban/basecamp';
import { badRequest, handle } from '../../../lib/nanban/api';

export const POST: APIRoute = async ({ request }) => {
  let trays: Record<string, { name?: string; ids: string[] }>;
  try {
    const b = await request.json();
    trays = b.trays;
    if (!trays || typeof trays !== 'object' || Array.isArray(trays)) return badRequest();
    for (const t of Object.values(trays)) {
      if (!t || !Array.isArray(t.ids) || !t.ids.every((id) => typeof id === 'string')) {
        return badRequest();
      }
    }
  } catch {
    return badRequest();
  }

  return handle(async () => {
    const overlay = await loadOverlay();
    overlay._meta = { ...overlay._meta, trays };
    await saveOverlay(overlay);
    return { ok: true };
  });
};
