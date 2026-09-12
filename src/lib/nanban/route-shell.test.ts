// Unit tests for the /nanban HTML shell response (src/pages/nanban/index.ts).
//
// NOT colocated with the route it tests: Astro's file-based routing claims every
// file under src/pages/, so a *.test.ts there becomes a route and `pnpm build`
// tries to prerender it — executing describe/it outside a runner. It lives beside
// the other nanban tests instead.
//
// Why this exists: the board is a tab people leave open for days, and index.html
// is served ?raw — invisible to `pnpm build`, `astro check` and the jsdom suite.
// NANBAN-006 shipped a contrast fix on 2026-09-09 that never reached the browser,
// because the response carried no cache directive at all and a stale copy was
// served instead. These tests pin the header that closes that gap.
//
// The route imports index.html?raw; vitest runs on Vite, so ?raw resolves here the
// same way it does in the Astro build.
import { describe, expect, it } from 'vitest';
import { GET } from '../../pages/nanban/index';

// The handler ignores its argument, but APIRoute is typed as taking a context.
const invoke = () => (GET as unknown as () => Response)();

describe('GET /nanban', () => {
  it('tells the browser to revalidate rather than reuse a cached shell', () => {
    const cacheControl = invoke().headers.get('cache-control') ?? '';
    // no-cache, not no-store: keep the copy, but check it is current every time.
    expect(cacheControl).toMatch(/\bno-cache\b/);
    expect(cacheControl).not.toMatch(/\bno-store\b/);
  });

  it('keeps authenticated HTML out of shared caches', () => {
    expect(invoke().headers.get('cache-control') ?? '').toMatch(/\bprivate\b/);
  });

  it('serves the board as HTML', async () => {
    const res = invoke();
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(res.status).toBe(200);
    // Proves the ?raw import actually delivered the board, not an empty string.
    await expect(res.text()).resolves.toContain('<title>Nanban</title>');
  });
});
