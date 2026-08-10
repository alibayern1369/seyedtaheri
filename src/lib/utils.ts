export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isVisibleSection(
  sections: { id: string; visible: boolean }[],
  id: string,
) {
  return sections.find((s) => s.id === id)?.visible !== false;
}
