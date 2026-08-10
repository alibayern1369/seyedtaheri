"use client";

import { useEffect, useState } from "react";
import type { ResumeContent } from "@/types/resume";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminEditor } from "@/components/admin/admin-editor";

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [content, setContent] = useState<ResumeContent | null>(null);

  async function load() {
    setChecking(true);
    try {
      const authRes = await fetch("/api/auth", { cache: "no-store" });
      const auth = (await authRes.json()) as { authenticated: boolean };
      setAuthenticated(auth.authenticated);
      if (auth.authenticated) {
        const contentRes = await fetch("/api/content", { cache: "no-store" });
        const data = (await contentRes.json()) as ResumeContent;
        setContent(data);
      }
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthenticated(false);
    setContent(null);
  }

  if (checking) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center text-sm text-[var(--muted)]">
        Loading admin…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <AdminLogin
        onSuccess={() => {
          void load();
        }}
      />
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center text-sm text-[var(--muted)]">
        Unable to load content
      </div>
    );
  }

  return <AdminEditor initialContent={content} onLogout={() => void logout()} />;
}
