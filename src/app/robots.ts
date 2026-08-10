import type { MetadataRoute } from "next";
import { getResumeContent } from "@/lib/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getResumeContent();
  const base = content.seo.siteUrl || "https://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
