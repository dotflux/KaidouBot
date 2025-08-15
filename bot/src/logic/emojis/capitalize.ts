export const capitalize = (s: string) =>
  s.length === 0 ? "" : s[0].toUpperCase() + s.slice(1).toLowerCase();

export const humanize = (raw?: string): string => {
  if (!raw) return "";
  return raw
    .replace(/[_\-.]+/g, " ") // underscores, hyphens, dots -> spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
    .split(" ")
    .map(capitalize)
    .join(" ");
};
