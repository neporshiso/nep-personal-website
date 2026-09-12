export const prerender = false;
import type { APIRoute } from 'astro';
import html from '../../lib/nanban/index.html?raw';

export const GET: APIRoute = () =>
  new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // index.html is served ?raw, so no CI gate ever parses it — the browser is
      // the only place a change to it is visible. Without this header the browser
      // may serve a heuristically cached copy and a shipped fix never arrives; that
      // is what happened to NANBAN-006, which shipped and then went unseen for a day.
      // `private` keeps authenticated HTML out of shared caches. `no-cache` rather
      // than `no-store` so the response stays bfcache-eligible. There is no ETag
      // yet, so revalidation is a plain GET rather than a conditional one — correct,
      // just not yet cheap; see the milestone queue for that follow-up.
      'Cache-Control': 'private, no-cache',
    },
  });
