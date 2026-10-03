export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function shortName(name: string) {
  const [first, last] = name.split(" ");
  return last ? `${first} ${last[0]}.` : first;
}
