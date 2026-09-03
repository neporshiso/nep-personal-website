import { defineMiddleware } from 'astro:middleware';
import { COOKIE_NAME, verifyCookieValue } from './lib/nanban/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  if (!path.startsWith('/nanban') || path === '/nanban/login') {
    return next();
  }
  if (await verifyCookieValue(context.cookies.get(COOKIE_NAME)?.value)) {
    return next();
  }
  if (path.startsWith('/nanban/api/')) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return context.redirect('/nanban/login');
});
