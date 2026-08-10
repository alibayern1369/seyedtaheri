import type { MetadataRoute } from "next";
import { getResumeContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const FALLBACK_SITE = "https://seyedtaheri.vercel.app";

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "") || FALLBACK_SITE;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let base = FALLBACK_SITE;
  try {
    const content = await getResumeContent();
    base = normalizeBase(content.seo.siteUrl || FALLBACK_SITE);
  } catch {
    // Keep fallback so Search Console always gets a valid sitemap.
  }

  const now = new Date();
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
