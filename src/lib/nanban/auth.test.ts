// Unit tests for the /nanban signed-cookie primitives.
//
// Runs under vitest's default `node` environment: auth.ts has no import-time
// side effects and Web Crypto is a Node global, so the only setup needed is the
// two env vars — which auth.ts reads lazily *inside* each call, never at import
// time, so stubbing them per-test is enough.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COOKIE_NAME, checkPassword, makeCookieValue, verifyCookieValue } from './auth';

const SECRET = 'test-cookie-secret-hunter2';
const OTHER_SECRET = 'a-completely-different-cookie-secret';
const PASSWORD = 'correct-horse';

const HOUR_MS = 60 * 60 * 1000;

// An independent re-implementation of auth.ts's private `sign()`. Black-box
// round-tripping can only ever say "this cookie verifies"; to tell "rejected
// because expired" apart from "rejected because the signature is wrong" we have
// to be able to mint a *genuinely signed* cookie for an arbitrary expiry and an
// arbitrary secret. The "mints ..." test below pins this helper to the real
// implementation, so a drift here fails loudly instead of weakening the suite.
const enc = new TextEncoder();
async function signWith(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

// `${expiryEpochMs}.${base64url(HMAC(secret, expiryEpochMs))}` — the real format.
const cookieFor = async (expiryMs: number, secret = SECRET) =>
  `${expiryMs}.${await signWith(secret, String(expiryMs))}`;

beforeEach(() => {
  vi.stubEnv('NANBAN_COOKIE_SECRET', SECRET);
  vi.stubEnv('NANBAN_PASSWORD', PASSWORD);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('nanban signed-cookie auth', () => {
  it('exposes the cookie name the middleware reads', () => {
    expect(COOKIE_NAME).toBe('nanban_auth');
  });

  describe('makeCookieValue', () => {
    it('mints `<future epoch ms>.<unpadded base64url signature>`', async () => {
      const value = await makeCookieValue();
      const [exp, sig, ...extra] = value.split('.');

      expect(extra).toEqual([]); // exactly one separator
      expect(exp).toMatch(/^\d+$/);
      expect(Number(exp)).toBeGreaterThan(Date.now());
      expect(sig).toMatch(/^[A-Za-z0-9_-]+$/); // base64url alphabet, padding stripped
      // Pins our local signer to the production one.
      expect(sig).toBe(await signWith(SECRET, exp!));
    });

    it('round-trips: a freshly minted cookie verifies', async () => {
      await expect(verifyCookieValue(await makeCookieValue())).resolves.toBe(true);
    });
  });

  describe('verifyCookieValue — accepts', () => {
    it('a hand-minted cookie with the same secret and a future expiry', async () => {
      const value = await cookieFor(Date.now() + HOUR_MS);
      await expect(verifyCookieValue(value)).resolves.toBe(true);
    });
  });

  describe('verifyCookieValue — rejects forged, stale, or foreign cookies', () => {
    // THE decisive case: a well-formed, unexpired cookie whose signature is
    // simply wrong must not be honoured.
    it('a valid future expiry carrying a garbage signature', async () => {
      const exp = Date.now() + HOUR_MS;
      await expect(verifyCookieValue(`${exp}.not-a-real-signature`)).resolves.toBe(false);
    });

    // Signature transplant: the signature is genuine, just for a *different*
    // expiry — so an attacker cannot extend their own session by editing the
    // timestamp and keeping the signature they were issued.
    it('a valid future expiry carrying a signature genuine for another expiry', async () => {
      const issued = Date.now() + HOUR_MS;
      const extended = issued + 365 * 24 * HOUR_MS;
      const stolenSig = await signWith(SECRET, String(issued));
      await expect(verifyCookieValue(`${extended}.${stolenSig}`)).resolves.toBe(false);
    });

    it('a correctly signed cookie whose expiry is in the past', async () => {
      // Correctly signed, so only the expiry check can reject this one.
      const value = await cookieFor(Date.now() - HOUR_MS);
      await expect(verifyCookieValue(value)).resolves.toBe(false);
    });

    it('a cookie signed under a different NANBAN_COOKIE_SECRET', async () => {
      const value = await cookieFor(Date.now() + HOUR_MS, OTHER_SECRET);
      // Verified against the configured secret, not the one it was signed with.
      await expect(verifyCookieValue(value)).resolves.toBe(false);
    });

    it('a cookie that verified under the old secret once the secret is rotated', async () => {
      const value = await makeCookieValue();
      expect(await verifyCookieValue(value)).toBe(true);
      vi.stubEnv('NANBAN_COOKIE_SECRET', OTHER_SECRET);
      // The secret is read per-call, so rotation invalidates issued cookies.
      await expect(verifyCookieValue(value)).resolves.toBe(false);
    });
  });

  // Malformed input is an ordinary "no" — it must *resolve* false, never reject.
  // Each malformed value below carries a genuine signature for the string it
  // actually contains, so only the format guard being tested can reject it.
  describe('verifyCookieValue — rejects malformed input by resolving false, not throwing', () => {
    it('undefined (no cookie present at all)', async () => {
      await expect(verifyCookieValue(undefined)).resolves.toBe(false);
    });

    it('the empty string', async () => {
      await expect(verifyCookieValue('')).resolves.toBe(false);
    });

    it('a value with no separator', async () => {
      const exp = String(Date.now() + HOUR_MS);
      await expect(verifyCookieValue(`${exp}${await signWith(SECRET, exp)}`)).resolves.toBe(false);
    });

    it('a value with a leading dot (empty expiry)', async () => {
      // Signature is genuine for the empty string, so `dot < 1` is the only
      // thing that can turn this away.
      await expect(verifyCookieValue(`.${await signWith(SECRET, '')}`)).resolves.toBe(false);
    });

    it('a non-numeric expiry', async () => {
      // Without the /^\d+$/ guard, Number('abc') is NaN, `NaN < Date.now()` is
      // false, and this genuinely-signed value would sail through.
      await expect(verifyCookieValue(`abc.${await signWith(SECRET, 'abc')}`)).resolves.toBe(false);
    });

    it('a digits-plus-letters expiry', async () => {
      const exp = `${Date.now() + HOUR_MS}x`;
      await expect(verifyCookieValue(`${exp}.${await signWith(SECRET, exp)}`)).resolves.toBe(false);
    });
  });

  describe('checkPassword', () => {
    it('accepts the configured password', async () => {
      await expect(checkPassword(PASSWORD)).resolves.toBe(true);
    });

    it('rejects a wrong password of the same length', async () => {
      const wrong = 'correct-house';
      expect(wrong).toHaveLength(PASSWORD.length); // same length, one character off
      await expect(checkPassword(wrong)).resolves.toBe(false);
    });

    it('rejects a wrong password of a different length', async () => {
      // safeEqual digests both sides, so a length mismatch is not a short-circuit.
      await expect(checkPassword(`${PASSWORD}-battery-staple`)).resolves.toBe(false);
      await expect(checkPassword('')).resolves.toBe(false);
    });
  });
});
