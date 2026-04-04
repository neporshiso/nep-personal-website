import type { APIRoute } from 'astro';
import {
  parseWebhookBody,
  generateMdoc,
  formatDate,
  verifySecret,
  upsertFile,
} from '../../lib/signals';

export const prerender = false;

const REPO = 'neporshiso/nep-personal-website';
const BRANCH = 'main';

export const POST: APIRoute = async ({ request, url }) => {
  // Size guard
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10_000) {
    return new Response(JSON.stringify({ error: 'Payload too large' }), {
      status: 413,
    });
  }

  // Authenticate via URL query param (TradingView doesn't support custom headers)
  const secret = url.searchParams.get('secret');
  const webhookSecret = import.meta.env.WEBHOOK_SECRET;
  if (!webhookSecret || !secret || !verifySecret(secret, webhookSecret)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Parse JSON body: {"s2":"COIN,PLTR","s4":"UNH"}
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
    });
  }

  const signals = parseWebhookBody(body);
  if (!signals) {
    return new Response(JSON.stringify({ error: 'No signals parsed' }), {
      status: 400,
    });
  }

  // Generate post
  const now = new Date();
  const dateStr = formatDate(now);
  const mdocContent = generateMdoc(signals, now);
  const filePath = `src/content/posts/signals-${dateStr}.mdoc`;

  // Commit to GitHub
  const githubToken = import.meta.env.GITHUB_TOKEN;
  if (!githubToken) {
    return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
      status: 500,
    });
  }

  const result = await upsertFile(REPO, BRANCH, filePath, mdocContent, githubToken);

  if (!result.ok) {
    return new Response(
      JSON.stringify({ error: 'GitHub API failed', status: result.status }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({
      status: 'published',
      slug: `signals-${dateStr}`,
      file: filePath,
      action: result.message,
      signals,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
