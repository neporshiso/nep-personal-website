// Signed-cookie auth for /nanban. Cookie value: `${expiryEpochMs}.${base64url(HMAC-SHA256(secret, expiry))}`
import { env } from './env';
const enc = new TextEncoder();

async function sign(msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(env('NANBAN_COOKIE_SECRET')),
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

// ponytail: constant-time equality via digest comparison — no char-by-char leak.
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all(
    [a, b].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))),
  );
  const ua = new Uint8Array(da);
  const ub = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

export const COOKIE_NAME = 'nanban_auth';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function makeCookieValue(): Promise<string> {
  const exp = String(Date.now() + THIRTY_DAYS_MS);
  return `${exp}.${await sign(exp)}`;
}

export async function verifyCookieValue(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const dot = value.indexOf('.');
  if (dot < 1) return false;
  const exp = value.slice(0, dot);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(value.slice(dot + 1), await sign(exp));
}

export async function checkPassword(input: string): Promise<boolean> {
  return safeEqual(input, env('NANBAN_PASSWORD'));
}
