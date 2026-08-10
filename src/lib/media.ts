import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { Redis } from "@upstash/redis";
import { mediaPublicUrl, type MediaKind } from "@/lib/media-url";
import {
  RESUME_FAVICON_KEY,
  RESUME_LOGO_KEY,
  RESUME_OG_KEY,
  RESUME_PHOTO_KEY,
} from "@/types/resume";

export type { MediaKind } from "@/lib/media-url";
export {
  isMediaKind,
  isManagedMediaPath,
  mediaPublicUrl,
} from "@/lib/media-url";

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

function normalizeStoredMedia(raw: unknown): StoredMedia | null {
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (
    typeof record.base64 !== "string" ||
    !record.base64 ||
    typeof record.contentType !== "string" ||
    !record.contentType
  ) {
    return null;
  }
  return { base64: record.base64, contentType: record.contentType };
}

export async function getMedia(kind: MediaKind): Promise<StoredMedia | null> {
  try {
    const redis = getRedis();
    if (redis) {
      return normalizeStoredMedia(await redis.get(MEDIA_KEYS[kind]));
    }

    const raw = await readFile(LOCAL_PATHS[kind], "utf8");
    return normalizeStoredMedia(JSON.parse(raw));
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
