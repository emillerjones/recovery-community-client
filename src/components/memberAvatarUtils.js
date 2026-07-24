export function memberInitials(username) {
  const words = String(username || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return (words.length > 1 ? words[0][0] + words.at(-1)[0] : words[0].slice(0, 2)).toUpperCase();
}
