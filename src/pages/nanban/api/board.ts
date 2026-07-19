export const prerender = false;
import type { APIRoute } from 'astro';
import { buildBoard } from '../../../lib/nanban/basecamp';
import { handle } from '../../../lib/nanban/api';

export const GET: APIRoute = () => handle(buildBoard);
