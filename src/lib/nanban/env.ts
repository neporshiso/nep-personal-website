// Astro dev loads .env files into import.meta.env only; Vercel provides real
// process.env at runtime. Read both so the same code works in both places.
export const env = (name: string): string =>
  (import.meta.env[name] ?? process.env[name]) as string;
