import { NextResponse } from "next/server";
import { getMedia, isMediaKind } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string }> },
) {
  const { kind } = await context.params;

  if (!isMediaKind(kind)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const media = await getMedia(kind);
  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bytes = Buffer.from(media.base64, "base64");
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": media.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
