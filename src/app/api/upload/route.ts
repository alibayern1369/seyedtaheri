import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getResumeContent, saveResumeContent } from "@/lib/content";
import {
  deleteMedia,
  isMediaKind,
  mediaPublicUrl,
  saveMedia,
  type MediaKind,
} from "@/lib/media";

const MAX_BYTES = 2.5 * 1024 * 1024;

const MAX_STORED_BYTES: Record<MediaKind, number> = {
  photo: 450 * 1024,
  og: 700 * 1024,
  logo: 300 * 1024,
  favicon: 150 * 1024,
};

function setContentUrl(
  content: Awaited<ReturnType<typeof getResumeContent>>,
  kind: MediaKind,
  url: string,
) {
  if (kind === "photo") {
    content.profile.photoUrl = url;
    return;
  }
  if (kind === "og") content.seo.ogImage = url;
  else if (kind === "logo") content.seo.logoUrl = url;
  else content.seo.faviconUrl = url;
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const kindRaw = form.get("kind") ?? "photo";

  if (!isMediaKind(kindRaw)) {
    return NextResponse.json(
      { error: "Invalid upload kind. Use photo, og, logo, or favicon." },
      { status: 400 },
    );
  }

  const kind = kindRaw;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/") && file.type !== "image/x-icon") {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be smaller than 2.5MB" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > MAX_STORED_BYTES[kind]) {
      return NextResponse.json(
        {
          error:
            "Compressed image is still too large. Try a smaller file.",
        },
        { status: 400 },
      );
    }

    await saveMedia(kind, {
      contentType: file.type || "image/jpeg",
      base64: buffer.toString("base64"),
    });

    const url = mediaPublicUrl(kind);
    const content = await getResumeContent();
    setContentUrl(content, kind, url);
    await saveResumeContent(content);

    return NextResponse.json({ url, kind });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const kindRaw = searchParams.get("kind") ?? "photo";

  if (!isMediaKind(kindRaw)) {
    return NextResponse.json(
      { error: "Invalid upload kind. Use photo, og, logo, or favicon." },
      { status: 400 },
    );
  }

  const kind = kindRaw;

  try {
    await deleteMedia(kind);
    const content = await getResumeContent();
    setContentUrl(content, kind, "");
    await saveResumeContent(content);
    return NextResponse.json({ ok: true, kind });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
