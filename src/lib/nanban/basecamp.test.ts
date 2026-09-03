// Unit tests for cardEntries, the single place where the overlay's `_meta`/card
// distinction is made.
import { describe, expect, it } from 'vitest';
import { cardEntries } from './basecamp';

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
