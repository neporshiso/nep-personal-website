export const prerender = false;
import type { APIRoute } from 'astro';
import { fetchCardDetail } from '../../../lib/nanban/basecamp';
import { badRequest, handle } from '../../../lib/nanban/api';

export const GET: APIRoute = ({ url }) => {
  const projectId = url.searchParams.get('project_id');
  const todoId = url.searchParams.get('todo_id');
  if (!projectId || !todoId) return Promise.resolve(badRequest());
  return handle(() => fetchCardDetail(projectId, todoId));
};
