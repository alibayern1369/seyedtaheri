import { ImageResponse } from "next/og";
import { getMedia } from "@/lib/media";

export const dynamic = "force-dynamic";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const media = (await getMedia("favicon")) ?? (await getMedia("logo"));
  if (media?.base64) {
    const bytes = Buffer.from(media.base64, "base64");
    return new Response(bytes, {
      headers: {
        "Content-Type": media.contentType || "image/png",
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111318",
          color: "#f2f4f7",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        ST
      </div>
    ),
    { ...size },
  );
}
