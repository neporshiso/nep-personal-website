interface Env {
  WEBHOOK_SECRET: string;
  GITHUB_TOKEN: string;
}

interface SignalData {
  stage2: string[];
  stage4: string[];
}

// ── Routing ──────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== 'POST' || url.pathname !== '/api/signals') {
      return json({ error: 'Not found' }, 404);
    }

    return handleSignals(request, url, env);
  },
} satisfies ExportedHandler<Env>;

// ── Handler ──────────────────────────────────────────────────────────────────

const REPO = 'neporshiso/nep-personal-website';
const BRANCH = 'main';

async function handleSignals(request: Request, url: URL, env: Env): Promise<Response> {
  // Size guard
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10_000) {
    return json({ error: 'Payload too large' }, 413);
  }

  // Authenticate via URL query param (TradingView doesn't support custom headers)
  const secret = url.searchParams.get('secret');
  if (!secret || !verifySecret(secret, env.WEBHOOK_SECRET)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const signals = parseWebhookBody(body);
  if (!signals) {
    return json({ error: 'No signals parsed' }, 400);
  }

  // Generate post
  const now = new Date();
  const dateStr = formatDate(now);
  const mdocContent = generateMdoc(signals, now);
  const filePath = `src/content/posts/signals-${dateStr}.mdoc`;

  // Commit to GitHub
  const result = await upsertFile(REPO, BRANCH, filePath, mdocContent, env.GITHUB_TOKEN);

  if (!result.ok) {
    return json({ error: 'GitHub API failed', status: result.status }, 500);
  }

  return json({
    status: 'published',
    slug: `signals-${dateStr}`,
    file: filePath,
    action: result.message,
    signals,
  });
}

// ── Parsing ──────────────────────────────────────────────────────────────────

function sanitizeTicker(raw: string): string {
  return raw.replace(/[^A-Z0-9.]/gi, '').toUpperCase().slice(0, 10);
}

function parseTickers(csv: string): string[] {
  if (!csv || !csv.trim()) return [];
  return csv.split(',').map(sanitizeTicker).filter(Boolean);
}

function parseWebhookBody(body: unknown): SignalData | null {
  if (!body || typeof body !== 'object') return null;
  const obj = body as Record<string, unknown>;

  const result: SignalData = {
    stage2: typeof obj.s2 === 'string' ? parseTickers(obj.s2) : [],
    stage4: typeof obj.s4 === 'string' ? parseTickers(obj.s4) : [],
  };

  if (result.stage2.length === 0 && result.stage4.length === 0) return null;
  return result;
}

// ── Post generation ──────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatTitle(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });
}

function generateMdoc(signals: SignalData, date: Date): string {
  const dateStr = formatDate(date);
  const title = `Weinstein Signals — ${formatTitle(date)}`;

  const excerptParts: string[] = [];
  if (signals.stage2.length > 0)
    excerptParts.push(`Stage 2: ${signals.stage2.join(', ')}`);
  if (signals.stage4.length > 0)
    excerptParts.push(`Stage 4: ${signals.stage4.join(', ')}`);
  const excerpt = excerptParts.join(' | ');

  let body = '';
  if (signals.stage2.length > 0) {
    body += '## Stage 2 — Bullish\n\n';
    body += 'These tickers entered Weinstein Stage 2 today — price is above a rising 150-day SMA.\n\n';
    for (const t of signals.stage2) body += `- **${t}**\n`;
    body += '\n';
  }
  if (signals.stage4.length > 0) {
    body += '## Stage 4 — Bearish\n\n';
    body += 'These tickers entered Weinstein Stage 4 today — price is below a declining 150-day SMA.\n\n';
    for (const t of signals.stage4) body += `- **${t}**\n`;
    body += '\n';
  }
  body += '---\n\n*Automated signal from the Nep Weinstein Scanner.*\n';

  return `---
title: '${title}'
tags:
  - trading-signals
draft: false
excerpt: '${excerpt}'
publishedDate: '${dateStr}'
---

${body}`;
}

// ── Security ─────────────────────────────────────────────────────────────────

function verifySecret(provided: string, expected: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(provided);
  const b = encoder.encode(expected);
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

// ── GitHub API ───────────────────────────────────────────────────────────────

async function upsertFile(
  repo: string,
  branch: string,
  path: string,
  content: string,
  token: string
): Promise<{ ok: boolean; status: number; message: string }> {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'signals-webhook-worker',
  };

  // Check if file exists (get SHA to update)
  let sha: string | undefined;
  const getResp = await fetch(url, { headers });
  if (getResp.ok) {
    const existing = (await getResp.json()) as { sha: string };
    sha = existing.sha;
  }

  const payload: Record<string, string> = {
    message: `signals: ${formatDate(new Date())}`,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) payload.sha = sha;

  const putResp = await fetch(url, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!putResp.ok) {
    const err = await putResp.text();
    return { ok: false, status: putResp.status, message: err };
  }

  return { ok: true, status: putResp.status, message: sha ? 'updated' : 'created' };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
