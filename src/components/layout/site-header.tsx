"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { ResumeContent } from "@/types/resume";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader({ content }: { content: ResumeContent }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = content.sections.filter(
    (s) => s.visible && s.id !== "hero",
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          "container-page glass-strong flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-all duration-300 sm:px-4",
          scrolled && "shadow-[var(--shadow)]",
        )}
      >
        <a
          href="#hero"
          className="focus-ring rounded-lg px-1.5 py-1 text-sm font-semibold tracking-tight"
        >
          {content.profile.name}
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="focus-ring rounded-full px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="focus-ring glass inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="container-page mt-2 lg:hidden">
          <nav
            className="glass-strong flex flex-col gap-1 rounded-2xl p-3"
            aria-label="Mobile"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-xl px-3 py-3 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--glass)] hover:text-[var(--fg)]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
