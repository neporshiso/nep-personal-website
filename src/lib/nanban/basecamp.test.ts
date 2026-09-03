// Unit tests for cardEntries, the single place where the overlay's `_meta`/card
// distinction is made.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cardEntries, createComment, textToHtml } from './basecamp';

// createComment goes through bcRequest, which needs a token from Redis and the
// account id from env; stub both so the test only exercises the outgoing request.
vi.mock('./redis', () => ({
  kvGet: async () => ({ access_token: 'tok', refresh_token: 'ref' }),
  kvSet: async () => {},
}));

describe('cardEntries', () => {
  it('excludes the _meta key', () => {
    const overlay = {
      _meta: { project_order: ['a'] },
      a: { column: 'To Do', position: 0 },
    };
    const keys = cardEntries(overlay).map(([k]) => k);
    expect(keys).not.toContain('_meta');
  });

  it('returns every other key with its exact entry object, preserving insertion order', () => {
    const entryA = { column: 'To Do', position: 0 };
    const entryB = { column: 'Done', position: 1 };
    const overlay = { a: entryA, b: entryB };
    expect(cardEntries(overlay)).toEqual([
      ['a', entryA],
      ['b', entryB],
    ]);
  });

  it('returns [] for {}', () => {
    expect(cardEntries({})).toEqual([]);
  });

  it("returns [] for { _meta: { project_order: ['x'] } }", () => {
    const overlay = { _meta: { project_order: ['x'] } };
    expect(cardEntries(overlay)).toEqual([]);
  });
});

describe('textToHtml', () => {
  it('escapes HTML-significant characters', () => {
    expect(textToHtml('<b>&"')).toBe('&lt;b&gt;&amp;&quot;');
  });

  it('converts newlines to line breaks', () => {
    expect(textToHtml('a\nb')).toBe('a<br>b');
  });
});

describe('createComment', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('POSTs escaped HTML content to the recording comments endpoint and maps the reply', async () => {
    vi.stubEnv('BASECAMP_ACCOUNT_ID', '42');
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 201,
      headers: new Headers(),
      json: async () => ({
        creator: { name: 'Nep Orshiso' },
        created_at: '2026-09-03T12:00:00Z',
        content: '&lt;script&gt;',
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const comment = await createComment(7, 9, '<script>\nhi');

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://3.basecampapi.com/42/buckets/7/recordings/9/comments.json');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ content: '&lt;script&gt;<br>hi' });
    expect(comment).toEqual({
      author: 'Nep Orshiso',
      created_at: '2026-09-03T12:00:00Z',
      content: '&lt;script&gt;',
    });
  });
});
