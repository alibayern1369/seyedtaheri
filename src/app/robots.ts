import type { MetadataRoute } from "next";
import { getResumeContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const FALLBACK_SITE = "https://seyedtaheri.vercel.app";

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "") || FALLBACK_SITE;
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  let base = FALLBACK_SITE;
  try {
    const content = await getResumeContent();
    base = normalizeBase(content.seo.siteUrl || FALLBACK_SITE);
  } catch {
    // keep fallback
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/media/", "/icon", "/apple-icon"],
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
