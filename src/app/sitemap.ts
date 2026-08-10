import type { MetadataRoute } from "next";
import { getResumeContent } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getResumeContent();
  const base = content.seo.siteUrl || "https://localhost:3000";
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
