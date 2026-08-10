export type MediaKind = "photo" | "og" | "logo" | "favicon";

export function isMediaKind(value: unknown): value is MediaKind {
  return (
    value === "photo" ||
    value === "og" ||
    value === "logo" ||
    value === "favicon"
  );
}

export function mediaPublicUrl(kind: MediaKind, version = Date.now()) {
  // Public (non-/api) path so crawlers aren't blocked by robots Disallow: /api
  return `/media/${kind}?v=${version}`;
}

export function isManagedMediaPath(url: string, kind?: MediaKind) {
  if (!url) return false;
  if (url.startsWith("data:")) return true;
  if (kind) {
    return (
      url.startsWith(`/media/${kind}`) ||
      url.startsWith(`/api/media/${kind}`) ||
      (kind === "photo" && url.startsWith("/api/photo"))
    );
  }
  return (
    url.startsWith("/media/") ||
    url.startsWith("/api/media/") ||
    url.startsWith("/api/photo")
  );
}
