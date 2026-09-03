export const prerender = false;
import type { APIRoute } from 'astro';
import { createComment } from '../../../lib/nanban/basecamp';
import { badRequest, handle, json } from '../../../lib/nanban/api';

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
    if (body.project_id == null || body.todo_id == null) return badRequest();
  } catch {
    return badRequest();
  }

  const content = String(body.content ?? '').trim();
  if (!content) return json({ error: 'content required' }, 400);

  return handle(async () => ({
    ok: true,
    comment: await createComment(body.project_id, body.todo_id, content),
  }));
};
