import type { ResumeContent } from "@/types/resume";

export function JsonLd({ content }: { content: ResumeContent }) {
  const image =
    content.seo.logoUrl ||
    content.profile.photoUrl ||
    content.seo.ogImage ||
    undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.profile.name,
    jobTitle: content.profile.title,
    email: content.profile.email,
    telephone: content.profile.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: content.profile.location,
    },
    url: content.seo.siteUrl,
    image: image || undefined,
    sameAs: content.socialLinks
      .map((l) => l.url)
      .filter((u) => u.startsWith("http")),
    description: content.seo.description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
