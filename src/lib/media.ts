import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { Redis } from "@upstash/redis";
import {
  RESUME_FAVICON_KEY,
  RESUME_LOGO_KEY,
  RESUME_OG_KEY,
  RESUME_PHOTO_KEY,
} from "@/types/resume";

export type MediaKind = "photo" | "og" | "logo" | "favicon";

export type StoredMedia = {
  contentType: string;
  base64: string;
};

const MEDIA_KEYS: Record<MediaKind, string> = {
  photo: RESUME_PHOTO_KEY,
  og: RESUME_OG_KEY,
  logo: RESUME_LOGO_KEY,
  favicon: RESUME_FAVICON_KEY,
};

const LOCAL_MEDIA_DIR = path.join(process.cwd(), ".data");

const LOCAL_PATHS: Record<MediaKind, string> = {
  photo: path.join(LOCAL_MEDIA_DIR, "profile-photo.json"),
  og: path.join(LOCAL_MEDIA_DIR, "og-image.json"),
  logo: path.join(LOCAL_MEDIA_DIR, "logo.json"),
  favicon: path.join(LOCAL_MEDIA_DIR, "favicon.json"),
};

const CONTENT_FIELDS: Record<
  MediaKind,
  "photoUrl" | "ogImage" | "logoUrl" | "faviconUrl"
> = {
  photo: "photoUrl",
  og: "ogImage",
  logo: "logoUrl",
  favicon: "faviconUrl",
};

export function isMediaKind(value: unknown): value is MediaKind {
  return (
    value === "photo" ||
    value === "og" ||
    value === "logo" ||
    value === "favicon"
  );
}

export function mediaContentField(kind: MediaKind) {
  return CONTENT_FIELDS[kind];
}

function hasRedisEnv() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function getRedis() {
  if (!hasRedisEnv()) return null;
  return Redis.fromEnv();
}

export async function saveMedia(
  kind: MediaKind,
  media: StoredMedia,
): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(MEDIA_KEYS[kind], media);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  await mkdir(LOCAL_MEDIA_DIR, { recursive: true });
  await writeFile(LOCAL_PATHS[kind], JSON.stringify(media), "utf8");
}

export async function getMedia(kind: MediaKind): Promise<StoredMedia | null> {
  try {
    const redis = getRedis();
    if (redis) {
      const stored = await redis.get<StoredMedia>(MEDIA_KEYS[kind]);
      if (stored?.base64 && stored?.contentType) return stored;
      return null;
    }

    const raw = await readFile(LOCAL_PATHS[kind], "utf8");
    const stored = JSON.parse(raw) as StoredMedia;
    if (stored?.base64 && stored?.contentType) return stored;
    return null;
  } catch {
    return null;
  }
}

export async function deleteMedia(kind: MediaKind): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(MEDIA_KEYS[kind]);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  try {
    await unlink(LOCAL_PATHS[kind]);
  } catch {
    // ignore missing file
  }
}

export function mediaPublicUrl(kind: MediaKind, version = Date.now()) {
  return `/api/media/${kind}?v=${version}`;
}

/** @deprecated Prefer getMedia("photo") */
export async function getProfilePhoto() {
  return getMedia("photo");
}

/** @deprecated Prefer saveMedia("photo", ...) */
export async function saveProfilePhoto(photo: StoredMedia) {
  return saveMedia("photo", photo);
}

/** @deprecated Prefer deleteMedia("photo") */
export async function deleteProfilePhoto() {
  return deleteMedia("photo");
}

/** @deprecated Prefer mediaPublicUrl("photo") */
export function profilePhotoPublicUrl(version = Date.now()) {
  return mediaPublicUrl("photo", version);
}
