import type { ComponentType } from "react";
import type { ResumeContent, SectionId } from "@/types/resume";
import { isVisibleSection } from "@/lib/utils";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ExperienceSection } from "@/components/sections/experience";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import { EducationSection } from "@/components/sections/education";
import { CertificationsSection } from "@/components/sections/certifications";
import { ServicesSection } from "@/components/sections/services";
import { ContactSection } from "@/components/sections/contact";

const sectionMap: Record<
  Exclude<SectionId, "hero">,
  ComponentType<{ content: ResumeContent }>
> = {
  about: AboutSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  skills: SkillsSection,
  education: EducationSection,
  certifications: CertificationsSection,
  services: ServicesSection,
  contact: ContactSection,
};

export function PortfolioPage({ content }: { content: ResumeContent }) {
  const ordered = content.sections.filter(
    (s) => s.id !== "hero" && isVisibleSection(content.sections, s.id),
  );

  return (
    <>
      <SiteHeader content={content} />
      <main>
        {isVisibleSection(content.sections, "hero") && (
          <HeroSection content={content} />
        )}
        {ordered.map((section) => {
          const Component = sectionMap[section.id as Exclude<SectionId, "hero">];
          if (!Component) return null;
          return <Component key={section.id} content={content} />;
        })}
      </main>
      <SiteFooter content={content} />
    </>
  );
}
