// Minimal Upstash Redis REST client. ponytail: two commands are all Nanban needs.
const url = () => process.env.UPSTASH_REDIS_REST_URL!;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN!;

async function command<T>(parts: string[]): Promise<T> {
  const res = await fetch(url(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(parts),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
  const { result } = (await res.json()) as { result: T };
  return result;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const raw = await command<string | null>(['GET', key]);
  return raw === null ? null : (JSON.parse(raw) as T);
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  await command(['SET', key, JSON.stringify(value)]);
}
