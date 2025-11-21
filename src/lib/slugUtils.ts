/**
 * Generate a URL-friendly slug from a name and append a random suffix.
 *
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove non-alphanumeric characters (keeps hyphens)
 * - Collapse multiple hyphens
 * - Append a random alphanumeric suffix of configurable length
 *
 * @param name Input display name to convert
 * @param options Optional configuration
 * @param options.suffixLength Length of random suffix (default: 5)
 * @returns Generated slug string, e.g. `hello-world-abc12`
 * @throws Error if the sanitized base becomes empty
 */
export function generateSlug(
  name: string,
  options: { suffixLength?: number } = {}
): string {
  const suffixLength = Number.isFinite(options.suffixLength)
    ? Math.max(1, Math.floor(options.suffixLength as number))
    : 5;

  const base = String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (!base) {
    throw new Error("Invalid name: cannot generate slug from empty base");
  }

  const rand = randomAlphaNumeric(suffixLength);
  return `${base}-${rand}`;
}

/**
 * Generate a random lowercase alphanumeric string of given length.
 */
export function randomAlphaNumeric(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    out += chars[idx];
  }
  return out;
}