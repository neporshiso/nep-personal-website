export const prerender = false;
import type { APIRoute } from 'astro';
import html from '../../lib/nanban/index.html?raw';

export const GET: APIRoute = () =>
  new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
