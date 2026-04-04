import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sanitizeTicker,
  parseWebhookBody,
  formatDate,
  formatTitle,
  generateMdoc,
  verifySecret,
  upsertFile,
} from './signals';

// ─────────────────────────────────────────────────────────────────────────────
// sanitizeTicker
// ─────────────────────────────────────────────────────────────────────────────
describe('sanitizeTicker', () => {
  it('passes through clean tickers', () => {
    expect(sanitizeTicker('AAPL')).toBe('AAPL');
    expect(sanitizeTicker('BRK.B')).toBe('BRK.B');
  });

  it('uppercases lowercase input', () => {
    expect(sanitizeTicker('aapl')).toBe('AAPL');
  });

  it('strips special characters', () => {
    expect(sanitizeTicker("AAPL'<script>")).toBe('AAPLSCRIPT');
    expect(sanitizeTicker('CO IN')).toBe('COIN');
  });

  it('truncates to 10 chars', () => {
    expect(sanitizeTicker('ABCDEFGHIJKLM')).toBe('ABCDEFGHIJ');
  });

  it('returns empty string for garbage', () => {
    expect(sanitizeTicker('!!!@@@')).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseWebhookBody — JSON format: {"s2":"COIN,PLTR","s4":"UNH"}
// ─────────────────────────────────────────────────────────────────────────────
describe('parseWebhookBody', () => {
  it('parses combined bull + bear JSON', () => {
    const result = parseWebhookBody({ s2: 'COIN,PLTR', s4: 'UNH' });
    expect(result).toEqual({
      stage2: ['COIN', 'PLTR'],
      stage4: ['UNH'],
    });
  });

  it('parses bull-only', () => {
    const result = parseWebhookBody({ s2: 'AAPL,MSFT', s4: '' });
    expect(result).toEqual({
      stage2: ['AAPL', 'MSFT'],
      stage4: [],
    });
  });

  it('parses bear-only', () => {
    const result = parseWebhookBody({ s2: '', s4: 'INTC,PFE' });
    expect(result).toEqual({
      stage2: [],
      stage4: ['INTC', 'PFE'],
    });
  });

  it('parses single ticker', () => {
    const result = parseWebhookBody({ s2: 'COST', s4: '' });
    expect(result).toEqual({
      stage2: ['COST'],
      stage4: [],
    });
  });

  it('returns null for empty signals', () => {
    expect(parseWebhookBody({ s2: '', s4: '' })).toBeNull();
  });

  it('returns null for null/undefined body', () => {
    expect(parseWebhookBody(null)).toBeNull();
    expect(parseWebhookBody(undefined)).toBeNull();
  });

  it('returns null for non-object body', () => {
    expect(parseWebhookBody('string')).toBeNull();
    expect(parseWebhookBody(42)).toBeNull();
  });

  it('handles missing s2/s4 fields', () => {
    expect(parseWebhookBody({ s2: 'AAPL' })).toEqual({
      stage2: ['AAPL'],
      stage4: [],
    });
    expect(parseWebhookBody({})).toBeNull();
  });

  it('sanitizes tickers in JSON', () => {
    const result = parseWebhookBody({ s2: 'aapl,<script>msft', s4: '' });
    expect(result).toEqual({
      stage2: ['AAPL', 'SCRIPTMSFT'],
      stage4: [],
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatDate / formatTitle
// ─────────────────────────────────────────────────────────────────────────────
describe('formatDate', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date('2026-04-03T20:00:00Z');
    expect(formatDate(date)).toBe('2026-04-03');
  });
});

describe('formatTitle', () => {
  it('formats date in human-readable US format', () => {
    const date = new Date('2026-04-03T20:00:00Z');
    const title = formatTitle(date);
    expect(title).toContain('April');
    expect(title).toContain('2026');
    expect(title).toContain('3');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateMdoc
// ─────────────────────────────────────────────────────────────────────────────
describe('generateMdoc', () => {
  const date = new Date('2026-04-03T20:00:00Z');

  it('generates valid frontmatter for combined signals', () => {
    const mdoc = generateMdoc({ stage2: ['COIN', 'PLTR'], stage4: ['UNH'] }, date);

    expect(mdoc).toContain("title: 'Weinstein Signals —");
    expect(mdoc).toContain('tags:');
    expect(mdoc).toContain('  - trading-signals');
    expect(mdoc).toContain('draft: false');
    expect(mdoc).toContain("publishedDate: '2026-04-03'");
    expect(mdoc).toContain("excerpt: 'Stage 2: COIN, PLTR | Stage 4: UNH'");

    expect(mdoc).toContain('## Stage 2 — Bullish');
    expect(mdoc).toContain('- **COIN**');
    expect(mdoc).toContain('- **PLTR**');
    expect(mdoc).toContain('## Stage 4 — Bearish');
    expect(mdoc).toContain('- **UNH**');
  });

  it('generates bull-only post', () => {
    const mdoc = generateMdoc({ stage2: ['AAPL'], stage4: [] }, date);
    expect(mdoc).toContain('## Stage 2 — Bullish');
    expect(mdoc).not.toContain('## Stage 4');
    expect(mdoc).toContain("excerpt: 'Stage 2: AAPL'");
  });

  it('generates bear-only post', () => {
    const mdoc = generateMdoc({ stage2: [], stage4: ['INTC'] }, date);
    expect(mdoc).not.toContain('## Stage 2');
    expect(mdoc).toContain('## Stage 4 — Bearish');
    expect(mdoc).toContain("excerpt: 'Stage 4: INTC'");
  });

  it('starts and ends with frontmatter delimiters', () => {
    const mdoc = generateMdoc({ stage2: ['AAPL'], stage4: [] }, date);
    expect(mdoc.startsWith('---\n')).toBe(true);
    expect(mdoc).toContain('\n---\n');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// verifySecret
// ─────────────────────────────────────────────────────────────────────────────
describe('verifySecret', () => {
  it('returns true for matching secrets', () => {
    expect(verifySecret('abc123', 'abc123')).toBe(true);
  });

  it('returns false for mismatched secrets', () => {
    expect(verifySecret('abc123', 'abc124')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(verifySecret('short', 'longer-secret')).toBe(false);
  });

  it('returns false for empty vs non-empty', () => {
    expect(verifySecret('', 'secret')).toBe(false);
  });

  it('returns true for two empty strings', () => {
    expect(verifySecret('', '')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// upsertFile (mocked GitHub API)
// ─────────────────────────────────────────────────────────────────────────────
describe('upsertFile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a new file when it does not exist', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    fetchSpy.mockResolvedValueOnce(
      new Response('Not found', { status: 404 })
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ content: { sha: 'abc123' } }), { status: 201 })
    );

    const result = await upsertFile(
      'test/repo', 'main', 'path/to/file.mdoc', 'content', 'fake-token'
    );

    expect(result.ok).toBe(true);
    expect(result.message).toBe('created');

    const putCall = fetchSpy.mock.calls[1];
    const putBody = JSON.parse(putCall[1]?.body as string);
    expect(putBody.sha).toBeUndefined();
  });

  it('updates an existing file with its sha', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ sha: 'existing-sha-123' }), { status: 200 })
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ content: { sha: 'new-sha' } }), { status: 200 })
    );

    const result = await upsertFile(
      'test/repo', 'main', 'path/to/file.mdoc', 'new content', 'fake-token'
    );

    expect(result.ok).toBe(true);
    expect(result.message).toBe('updated');

    const putCall = fetchSpy.mock.calls[1];
    const putBody = JSON.parse(putCall[1]?.body as string);
    expect(putBody.sha).toBe('existing-sha-123');
  });

  it('returns error when GitHub PUT fails', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    fetchSpy.mockResolvedValueOnce(
      new Response('Not found', { status: 404 })
    );
    fetchSpy.mockResolvedValueOnce(
      new Response('Unauthorized', { status: 401 })
    );

    const result = await upsertFile(
      'test/repo', 'main', 'path/to/file.mdoc', 'content', 'bad-token'
    );

    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });

  it('sends correct authorization header', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    fetchSpy.mockResolvedValueOnce(
      new Response('Not found', { status: 404 })
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 })
    );

    await upsertFile('test/repo', 'main', 'file.mdoc', 'content', 'my-token');

    const getCall = fetchSpy.mock.calls[0];
    expect((getCall[1]?.headers as Record<string, string>).Authorization).toBe('Bearer my-token');
  });

  it('base64 encodes the content', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    fetchSpy.mockResolvedValueOnce(
      new Response('Not found', { status: 404 })
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 })
    );

    await upsertFile('test/repo', 'main', 'file.mdoc', 'hello world', 'token');

    const putCall = fetchSpy.mock.calls[1];
    const putBody = JSON.parse(putCall[1]?.body as string);
    expect(Buffer.from(putBody.content, 'base64').toString('utf-8')).toBe('hello world');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// End-to-end: webhook JSON → mdoc (no network, no mocks)
// ─────────────────────────────────────────────────────────────────────────────
describe('end-to-end: webhook JSON to post', () => {
  it('full pipeline produces a valid mdoc from a webhook body', () => {
    // Simulates exactly what TradingView sends
    const webhookBody = { s2: 'COST,NFLX', s4: 'UNH,ISRG' };
    const signals = parseWebhookBody(webhookBody);
    expect(signals).not.toBeNull();

    const date = new Date('2026-04-03T20:00:00Z');
    const mdoc = generateMdoc(signals!, date);

    // Validate frontmatter structure
    const frontmatterMatch = mdoc.match(/^---\n([\s\S]*?)\n---/);
    expect(frontmatterMatch).not.toBeNull();

    const frontmatter = frontmatterMatch![1];
    expect(frontmatter).toContain('title:');
    expect(frontmatter).toContain('publishedDate:');
    expect(frontmatter).toContain('tags:');
    expect(frontmatter).toContain('trading-signals');

    // Validate all tickers are in the body
    expect(mdoc).toContain('**COST**');
    expect(mdoc).toContain('**NFLX**');
    expect(mdoc).toContain('**UNH**');
    expect(mdoc).toContain('**ISRG**');
  });

  it('matches the exact Pine alert format', () => {
    // This is exactly what the Pine script produces:
    // alert('{"s2":"COIN,PLTR","s4":"UNH"}', ...)
    const pineOutput = '{"s2":"COIN,PLTR","s4":"UNH"}';
    const parsed = JSON.parse(pineOutput);
    const signals = parseWebhookBody(parsed);

    expect(signals).toEqual({
      stage2: ['COIN', 'PLTR'],
      stage4: ['UNH'],
    });
  });

  it('handles Pine alert with no bears', () => {
    // alert('{"s2":"AAPL","s4":""}', ...)
    const pineOutput = '{"s2":"AAPL","s4":""}';
    const parsed = JSON.parse(pineOutput);
    const signals = parseWebhookBody(parsed);

    expect(signals).toEqual({
      stage2: ['AAPL'],
      stage4: [],
    });
  });
});
