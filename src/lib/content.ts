import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { Redis } from "@upstash/redis";
import { defaultResumeContent } from "@/data/default-resume";
import { getMedia, isManagedMediaPath, mediaPublicUrl, type MediaKind } from "@/lib/media";
import {
  RESUME_CONTENT_KEY,
  type RecaptchaSettings,
  type ResumeContent,
} from "@/types/resume";

const LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_CONTENT_PATH = path.join(LOCAL_DATA_DIR, "content.json");

function hasRedisEnv() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function getRedis() {
  if (!hasRedisEnv()) return null;
  return Redis.fromEnv();
}

async function readLocalContent(): Promise<ResumeContent | null> {
  try {
    const raw = await readFile(LOCAL_CONTENT_PATH, "utf8");
    return JSON.parse(raw) as ResumeContent;
  } catch {
    return null;
  }
}

async function writeLocalContent(content: ResumeContent): Promise<void> {
  await mkdir(LOCAL_DATA_DIR, { recursive: true });
  await writeFile(LOCAL_CONTENT_PATH, JSON.stringify(content), "utf8");
}

async function resolveMediaUrl(
  current: string,
  kind: MediaKind,
): Promise<string> {
  const stored = await getMedia(kind);
  if (!stored) {
    // Drop dangling managed URLs when the blob is missing.
    if (isManagedMediaPath(current, kind)) return "";
    return current;
  }

  // Keep a stable /media URL (preserve cache-busting version when already set).
  if (current.startsWith(`/media/${kind}`)) {
    return current;
  }

  // Rewrite legacy /api paths to the public /media route.
  if (isManagedMediaPath(current, kind) || !current) {
    return mediaPublicUrl(kind);
  }

  // External URL in content, but we also have a stored blob — prefer stored.
  return mediaPublicUrl(kind);
}

async function withStoredMedia(content: ResumeContent): Promise<ResumeContent> {
  const [photoUrl, ogImage, logoUrl, faviconUrl] = await Promise.all([
    resolveMediaUrl(content.profile.photoUrl, "photo"),
    resolveMediaUrl(content.seo.ogImage, "og"),
    resolveMediaUrl(content.seo.logoUrl, "logo"),
    resolveMediaUrl(content.seo.faviconUrl, "favicon"),
  ]);

  if (
    photoUrl === content.profile.photoUrl &&
    ogImage === content.seo.ogImage &&
    logoUrl === content.seo.logoUrl &&
    faviconUrl === content.seo.faviconUrl
  ) {
    return content;
  }

  return {
    ...content,
    profile: { ...content.profile, photoUrl },
    seo: { ...content.seo, ogImage, logoUrl, faviconUrl },
  };
}

export async function getResumeContent(): Promise<ResumeContent> {
  try {
    const redis = getRedis();
    if (redis) {
      const stored = await redis.get<ResumeContent>(RESUME_CONTENT_KEY);
      if (!stored) {
        return withStoredMedia(defaultResumeContent);
      }
      return withStoredMedia(mergeWithDefaults(stored));
    }

    const local = await readLocalContent();
    if (!local) {
      return withStoredMedia(defaultResumeContent);
    }
    return withStoredMedia(mergeWithDefaults(local));
  } catch {
    try {
      return await withStoredMedia(defaultResumeContent);
    } catch {
      return defaultResumeContent;
    }
  }
}

export async function saveResumeContent(content: ResumeContent): Promise<void> {
  // Keep content JSON small: data URLs belong in the dedicated media store.
  const toStore: ResumeContent = {
    ...content,
    profile: {
      ...content.profile,
      photoUrl: content.profile.photoUrl.startsWith("data:")
        ? mediaPublicUrl("photo")
        : content.profile.photoUrl,
    },
    seo: {
      ...content.seo,
      ogImage: content.seo.ogImage.startsWith("data:")
        ? mediaPublicUrl("og")
        : content.seo.ogImage,
      logoUrl: content.seo.logoUrl.startsWith("data:")
        ? mediaPublicUrl("logo")
        : content.seo.logoUrl,
      faviconUrl: content.seo.faviconUrl.startsWith("data:")
        ? mediaPublicUrl("favicon")
        : content.seo.faviconUrl,
    },
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(RESUME_CONTENT_KEY, toStore);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  await writeLocalContent(toStore);
}

function mergeWithDefaults(stored: ResumeContent): ResumeContent {
  return {
    ...defaultResumeContent,
    ...stored,
    profile: { ...defaultResumeContent.profile, ...stored.profile },
    about: { ...defaultResumeContent.about, ...stored.about },
    experience: {
      ...defaultResumeContent.experience,
      ...stored.experience,
      items: stored.experience?.items ?? defaultResumeContent.experience.items,
    },
    education: {
      ...defaultResumeContent.education,
      ...stored.education,
      items: stored.education?.items ?? defaultResumeContent.education.items,
    },
    projects: {
      ...defaultResumeContent.projects,
      ...stored.projects,
      items: stored.projects?.items ?? defaultResumeContent.projects.items,
    },
    skills: {
      ...defaultResumeContent.skills,
      ...stored.skills,
      categories:
        stored.skills?.categories ?? defaultResumeContent.skills.categories,
    },
    certifications: {
      ...defaultResumeContent.certifications,
      ...stored.certifications,
      items:
        stored.certifications?.items ??
        defaultResumeContent.certifications.items,
    },
    services: {
      ...defaultResumeContent.services,
      ...stored.services,
      items: stored.services?.items ?? defaultResumeContent.services.items,
    },
    contact: { ...defaultResumeContent.contact, ...stored.contact },
    socialLinks: stored.socialLinks ?? defaultResumeContent.socialLinks,
    sections: stored.sections ?? defaultResumeContent.sections,
    seo: { ...defaultResumeContent.seo, ...stored.seo },
    recaptcha: mergeRecaptcha(stored.recaptcha),
  };
}

function mergeRecaptcha(
  stored: Partial<RecaptchaSettings> | undefined,
): RecaptchaSettings {
  const base = defaultResumeContent.recaptcha;
  const minScore = Number(stored?.minScore);
  return {
    protectLogin: Boolean(stored?.protectLogin ?? base.protectLogin),
    protectSite: Boolean(stored?.protectSite ?? base.protectSite),
    siteKey: stored?.siteKey ?? base.siteKey,
    secretKey: stored?.secretKey ?? base.secretKey,
    minScore:
      Number.isFinite(minScore) && minScore >= 0 && minScore <= 1
        ? minScore
        : base.minScore,
  };
}

/** Strip the reCAPTCHA secret before sending content to anonymous clients. */
export function withoutRecaptchaSecret(content: ResumeContent): ResumeContent {
  if (!content.recaptcha?.secretKey) return content;
  return {
    ...content,
    recaptcha: { ...content.recaptcha, secretKey: "" },
  };
}

export function getRecaptchaPublicConfig(content: ResumeContent) {
  const { recaptcha } = content;
  const configured = Boolean(recaptcha.siteKey && recaptcha.secretKey);
  return {
    protectLogin: configured && recaptcha.protectLogin,
    protectSite: configured && recaptcha.protectSite,
    siteKey: configured ? recaptcha.siteKey : "",
    minScore: recaptcha.minScore,
  };
}
