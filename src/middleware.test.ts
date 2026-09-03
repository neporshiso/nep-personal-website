// Unit tests for the /nanban gate — the only thing standing between a public
// domain and a personal task board.
//
// middleware.ts imports `astro:middleware`, a Vite *virtual* module registered
// only by Astro's build pipeline, so a bare import fails at resolve time under
// vitest. `defineMiddleware` is a runtime identity function, so a module shim is
// all that is needed — no vitest.config.ts. vitest hoists the vi.mock call below
// above the imports, so the shim is registered before ./middleware evaluates.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COOKIE_NAME, makeCookieValue } from './lib/nanban/auth';
import { onRequest } from './middleware';

vi.mock('astro:middleware', () => ({ defineMiddleware: (fn: unknown) => fn }));

const SECRET = 'test-cookie-secret-hunter2';

// Identity sentinel: pass-through is asserted as "the middleware returned
// exactly what next() returned", not merely "a 200 came back".
const DOWNSTREAM = new Response('rendered page', { status: 200 });
const makeNext = () => vi.fn(async () => DOWNSTREAM);

// The middleware touches exactly four things on the context: url.pathname,
// cookies.get(name), redirect(path) and next(). Nothing else is stubbed because
// nothing else is read.
function makeContext(pathname: string, cookie?: string) {
  const get = vi.fn((name: string) =>
    cookie !== undefined && name === COOKIE_NAME ? { value: cookie } : undefined,
  );
  // Mirrors what real Astro's context.redirect() returns.
  const redirect = vi.fn(
    (path: string) => new Response(null, { status: 302, headers: { Location: path } }),
  );
  return { url: new URL(`https://neporshiso.com${pathname}`), cookies: { get }, redirect };
}

type Ctx = ReturnType<typeof makeContext>;
type Next = ReturnType<typeof makeNext>;

const run = (ctx: Ctx, next: Next) =>
  (onRequest as unknown as (c: Ctx, n: Next) => Promise<Response>)(ctx, next);

beforeEach(() => {
  vi.stubEnv('NANBAN_COOKIE_SECRET', SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('/nanban auth gate (src/middleware.ts)', () => {
  describe('guarded paths without a valid cookie', () => {
    it('answers an API path with a 401 JSON error and never calls next', async () => {
      const ctx = makeContext('/nanban/api/board');
      const next = makeNext();

      const res = await run(ctx, next);

      expect(res.status).toBe(401);
      expect(await res.text()).toBe('{"error":"unauthorized"}');
      expect(res.headers.get('content-type')).toBe('application/json');
      // The board handler must never run for an unauthenticated caller.
      expect(next).not.toHaveBeenCalled();
      expect(ctx.redirect).not.toHaveBeenCalled();
    });

    it('redirects a page path to /nanban/login and never calls next', async () => {
      const ctx = makeContext('/nanban');
      const next = makeNext();

      const res = await run(ctx, next);

      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toBe('/nanban/login');
      expect(ctx.redirect).toHaveBeenCalledWith('/nanban/login');
      expect(next).not.toHaveBeenCalled();
    });

    it('treats a forged cookie exactly like no cookie at all', async () => {
      const exp = Date.now() + 60 * 60 * 1000;
      const ctx = makeContext('/nanban/api/board', `${exp}.forged-signature`);
      const next = makeNext();

      const res = await run(ctx, next);

      expect(ctx.cookies.get).toHaveBeenCalledWith(COOKIE_NAME);
      expect(res.status).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('redirects a nested page path too', async () => {
      const ctx = makeContext('/nanban/settings/deep');
      const next = makeNext();

      const res = await run(ctx, next);

      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toBe('/nanban/login');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('paths the gate lets through without checking a cookie', () => {
    it('passes /nanban/login straight to next without reading the cookie', async () => {
      const ctx = makeContext('/nanban/login');
      const next = makeNext();

      const res = await run(ctx, next);

      expect(res).toBe(DOWNSTREAM);
      expect(next).toHaveBeenCalledTimes(1);
      // The login page must be reachable *before* a cookie exists, so no cookie
      // lookup should happen at all on this path.
      expect(ctx.cookies.get).not.toHaveBeenCalled();
      expect(ctx.redirect).not.toHaveBeenCalled();
    });

    it('passes a non-/nanban path through untouched', async () => {
      const ctx = makeContext('/thoughts');
      const next = makeNext();

      const res = await run(ctx, next);

      expect(res).toBe(DOWNSTREAM);
      expect(next).toHaveBeenCalledTimes(1);
      expect(ctx.cookies.get).not.toHaveBeenCalled();
      expect(ctx.redirect).not.toHaveBeenCalled();
    });

    // LATENT FLAW — DOCUMENTED, NOT ENDORSED.
    //
    // The bypass is `path.startsWith('/nanban/login')`: a prefix test, not a
    // path-segment match. So any path merely *beginning* with '/nanban/login'
    // skips the cookie check entirely — '/nanban/loginXYZ', '/nanban/login-admin',
    // '/nanban/loginapi/board', and so on. Nothing routes to such paths today,
    // so this is not currently exploitable, and fixing it is explicitly out of
    // scope here. This test pins the CURRENT behaviour so that a future fix has
    // to update a test deliberately rather than change the gate silently.
    it('BOUNDARY: /nanban/loginXYZ bypasses the gate (prefix match, not segment match)', async () => {
      const ctx = makeContext('/nanban/loginXYZ');
      const next = makeNext();

      const res = await run(ctx, next);

      expect(res).toBe(DOWNSTREAM);
      expect(next).toHaveBeenCalledTimes(1);
      expect(ctx.cookies.get).not.toHaveBeenCalled();
    });
  });

  describe('guarded paths with a valid cookie', () => {
    it('lets a page request through', async () => {
      const ctx = makeContext('/nanban', await makeCookieValue());
      const next = makeNext();

      const res = await run(ctx, next);

      expect(ctx.cookies.get).toHaveBeenCalledWith(COOKIE_NAME);
      expect(res).toBe(DOWNSTREAM);
      expect(next).toHaveBeenCalledTimes(1);
      expect(ctx.redirect).not.toHaveBeenCalled();
    });

    it('lets an API request through', async () => {
      const ctx = makeContext('/nanban/api/board', await makeCookieValue());
      const next = makeNext();

      const res = await run(ctx, next);

      expect(res).toBe(DOWNSTREAM);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toBe(401);
    });
  });
});
