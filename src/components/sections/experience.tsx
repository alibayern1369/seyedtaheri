"use client";

import { useState } from "react";
import type { ResumeContent } from "@/types/resume";
import { Reveal } from "@/components/ui/reveal";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export function ExperienceSection({ content }: { content: ResumeContent }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <section id="experience" className="section">
      <div className="container-page">
        <Reveal>
          <p className="section-kicker">Career</p>
          <h2 className="section-title">{content.experience.heading}</h2>
        </Reveal>

        <div className="mt-8 space-y-4">
          {content.experience.items.map((item, index) => {
            const isOpen = expanded[item.id] ?? index === 0;
            const visibleBullets = isOpen ? item.bullets : item.bullets.slice(0, 3);
            return (
              <Reveal key={item.id} delay={Math.min(index * 0.05, 0.2)}>
                <GlassCard className="p-5 sm:p-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)] sm:text-base">
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm text-[var(--faint)]">
                      {item.startDate} — {item.endDate}
                    </p>
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    {visibleBullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="relative pl-4 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]"
                      >
                        <span className="absolute top-2 left-0 h-1.5 w-1.5 rounded-full bg-[var(--accent)]/70" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {item.bullets.length > 3 && (
                    <button
                      type="button"
                      className={cn(
                        "mt-4 text-sm font-medium text-[var(--accent)] transition-opacity hover:opacity-80",
                      )}
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [item.id]: !isOpen,
                        }))
                      }
                    >
                      {isOpen
                        ? "Show less"
                        : `Show ${item.bullets.length - 3} more`}
                    </button>
                  )}
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
