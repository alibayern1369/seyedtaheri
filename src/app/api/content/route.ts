import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getResumeContent, saveResumeContent } from "@/lib/content";
import type { ResumeContent } from "@/types/resume";

export async function GET() {
  const content = await getResumeContent();
  return NextResponse.json(content, {
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
    await saveResumeContent(content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
