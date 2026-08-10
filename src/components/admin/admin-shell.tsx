"use client";

import { useEffect, useState } from "react";
import type { ResumeContent } from "@/types/resume";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminEditor } from "@/components/admin/admin-editor";

export function AdminShell({ initialContent }: { initialContent: ResumeContent }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [authRes, contentRes] = await Promise.all([
          fetch("/api/auth"),
          fetch("/api/content"),
        ]);
        const auth = (await authRes.json()) as { authenticated: boolean };
        if (contentRes.ok) {
          const data = (await contentRes.json()) as ResumeContent;
          if (alive) setContent(data);
        }
        if (alive) setAuthenticated(auth.authenticated);
      } catch {
        if (alive) setAuthenticated(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthenticated(false);
  }

  if (authenticated === null) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center text-sm text-[var(--muted)]">
        Loading admin…
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return <AdminEditor initialContent={content} onLogout={logout} />;
}
