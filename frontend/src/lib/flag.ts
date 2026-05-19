// Convert ISO-3166 alpha-2 to a flag emoji using regional indicator symbols.
export function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🏳";
  const A = 0x1f1e6;
  const a = code.toUpperCase().charCodeAt(0) - 65;
  const b = code.toUpperCase().charCodeAt(1) - 65;
  if (a < 0 || a > 25 || b < 0 || b > 25) return "🏳";
  return String.fromCodePoint(A + a) + String.fromCodePoint(A + b);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "?";
}
