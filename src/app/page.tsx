import { PortfolioPage } from "@/components/portfolio-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getResumeContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getResumeContent();
  return (
    <>
      <JsonLd content={content} />
      <PortfolioPage content={content} />
    </>
  );
}
