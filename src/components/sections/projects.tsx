import type { ResumeContent } from "@/types/resume";
import { Reveal } from "@/components/ui/reveal";
import { GlassCard } from "@/components/ui/glass-card";

export function ProjectsSection({ content }: { content: ResumeContent }) {
  return (
    <section id="projects" className="section">
      <div className="container-page">
        <Reveal>
          <p className="section-kicker">Selected work</p>
          <h2 className="section-title">{content.projects.heading}</h2>
        </Reveal>

        <div className="mt-8 grid gap-4">
          {content.projects.items.map((project, index) => (
            <Reveal key={project.id} delay={Math.min(index * 0.06, 0.18)}>
              <GlassCard className="p-5 sm:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {project.role}
                    </p>
                  </div>
                  <span className="chip w-fit">{project.status}</span>
                </div>
                {project.description && (
                  <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
                    {project.description}
                  </p>
                )}
                <ul className="mt-5 space-y-2.5">
                  {project.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="relative pl-4 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]"
                    >
                      <span className="absolute top-2 left-0 h-1.5 w-1.5 rounded-full bg-[var(--accent)]/70" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                {project.links && project.links.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost focus-ring !px-3 !py-1.5 text-sm"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
