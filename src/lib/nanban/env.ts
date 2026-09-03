// Astro dev loads .env files into import.meta.env only; Vercel provides real
// process.env at runtime. Read both so the same code works in both places.
// Fail closed: an unset or empty value throws rather than silently returning
// an unusable string, so misconfiguration surfaces immediately instead of
// producing a broken secret comparison downstream.
export const env = (name: string): string => {
  const value = (import.meta.env[name] ?? process.env[name]) as string | undefined;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};
