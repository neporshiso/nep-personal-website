// Unit tests for the fail-closed env var reader used by nanban.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from './env';

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('env', () => {
  it('returns the value when set', () => {
    vi.stubEnv('SOME_VAR', 'a-value');
    expect(env('SOME_VAR')).toBe('a-value');
  });

  it('throws with a message containing the variable name when unset', () => {
    vi.stubEnv('SOME_VAR', undefined);
    expect(() => env('SOME_VAR')).toThrow(/SOME_VAR/);
  });

  it('throws when set to the empty string', () => {
    vi.stubEnv('SOME_VAR', '');
    expect(() => env('SOME_VAR')).toThrow(/SOME_VAR/);
  });
});
