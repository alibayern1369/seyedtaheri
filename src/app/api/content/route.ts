import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getResumeContent,
  saveResumeContent,
  withoutRecaptchaSecret,
} from "@/lib/content";
import type { ResumeContent } from "@/types/resume";

export async function GET() {
  const content = await getResumeContent();
  const payload = (await isAuthenticated())
    ? content
    : withoutRecaptchaSecret(content);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = (await request.json()) as ResumeContent;
    if (!content?.profile?.name) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    // Preserve the existing secret if the client omitted it.
    if (!content.recaptcha?.secretKey) {
      const existing = await getResumeContent();
      content.recaptcha = {
        ...existing.recaptcha,
        ...content.recaptcha,
        secretKey: existing.recaptcha.secretKey,
      };
    }

    await saveResumeContent(content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
