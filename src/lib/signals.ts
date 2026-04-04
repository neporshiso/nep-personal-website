// ─────────────────────────────────────────────────────────────────────────────
// Signal processing logic — pure functions, no Astro or env dependencies
// ─────────────────────────────────────────────────────────────────────────────

export interface SignalData {
  stage2: string[];
  stage4: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Parsing — JSON body from TradingView webhook: {"s2":"COIN,PLTR","s4":"UNH"}
// ─────────────────────────────────────────────────────────────────────────────
export function sanitizeTicker(raw: string): string {
  return raw.replace(/[^A-Z0-9.]/gi, '').toUpperCase().slice(0, 10);
}

function parseTickers(csv: string): string[] {
  if (!csv || !csv.trim()) return [];
  return csv.split(',').map(sanitizeTicker).filter(Boolean);
}

export function parseWebhookBody(body: unknown): SignalData | null {
  if (!body || typeof body !== 'object') return null;
  const obj = body as Record<string, unknown>;

  const result: SignalData = {
    stage2: typeof obj.s2 === 'string' ? parseTickers(obj.s2) : [],
    stage4: typeof obj.s4 === 'string' ? parseTickers(obj.s4) : [],
  };

  if (result.stage2.length === 0 && result.stage4.length === 0) return null;
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Post generation — .mdoc file content
// ─────────────────────────────────────────────────────────────────────────────
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTitle(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });
}

export function generateMdoc(signals: SignalData, date: Date): string {
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

// ─────────────────────────────────────────────────────────────────────────────
// Security — constant-time secret comparison
// ─────────────────────────────────────────────────────────────────────────────
export function verifySecret(provided: string, expected: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(provided);
  const b = encoder.encode(expected);
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub API — create or update file in repo
// ─────────────────────────────────────────────────────────────────────────────
export async function upsertFile(
  repo: string,
  branch: string,
  path: string,
  content: string,
  token: string
): Promise<{ ok: boolean; status: number; message: string }> {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Check if file exists (for dedup — get SHA to update)
  let sha: string | undefined;
  const getResp = await fetch(url, { headers });
  if (getResp.ok) {
    const existing = (await getResp.json()) as { sha: string };
    sha = existing.sha;
  }

  const payload: Record<string, string> = {
    message: `signals: ${formatDate(new Date())}`,
    content: Buffer.from(content, 'utf-8').toString('base64'),
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
