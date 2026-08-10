import type { ResumeContent } from "@/types/resume";
import { SocialIcons } from "@/components/ui/social-icons";

export function SiteFooter({ content }: { content: ResumeContent }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--border)] py-10">
      <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium tracking-tight">
            {content.profile.name}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            © {year} · {content.profile.title}
          </p>
        </div>
        <SocialIcons links={content.socialLinks} />
      </div>
    </footer>
  );
}
