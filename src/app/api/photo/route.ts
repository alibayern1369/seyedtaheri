import { NextResponse } from "next/server";
import { getMedia } from "@/lib/media";

/** Backward-compatible profile photo endpoint. */
export async function GET() {
  const photo = await getMedia("photo");
  if (!photo) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bytes = Buffer.from(photo.base64, "base64");
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": photo.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
