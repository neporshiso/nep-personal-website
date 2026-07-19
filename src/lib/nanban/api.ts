import { BasecampError } from './basecamp';

export const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const badRequest = () => json({ error: 'bad request' }, 400);

// Run a handler, mapping Basecamp/unexpected failures to 502 like server.py did.
export async function handle(fn: () => Promise<unknown>): Promise<Response> {
  try {
    return json(await fn());
  } catch (e) {
    if (e instanceof BasecampError) return json({ error: e.message }, 502);
    return json({ error: e instanceof Error ? e.message : String(e) }, 502);
  }
}
