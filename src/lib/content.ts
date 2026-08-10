import { Redis } from "@upstash/redis";
import { defaultResumeContent } from "@/data/default-resume";
import { RESUME_CONTENT_KEY, type ResumeContent } from "@/types/resume";

function hasRedisEnv() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function getRedis() {
  if (!hasRedisEnv()) return null;
  return Redis.fromEnv();
}

export async function getResumeContent(): Promise<ResumeContent> {
  try {
    const redis = getRedis();
    if (!redis) return defaultResumeContent;
    const stored = await redis.get<ResumeContent>(RESUME_CONTENT_KEY);
    if (!stored) return defaultResumeContent;
    return mergeWithDefaults(stored);
  } catch {
    return defaultResumeContent;
  }
}

export async function saveResumeContent(content: ResumeContent): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    throw new Error(
      "Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }
  await redis.set(RESUME_CONTENT_KEY, content);
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
  };
}
