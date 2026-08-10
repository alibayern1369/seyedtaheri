const PRESETS = {
  photo: { maxEdge: 960, quality: 0.82, forceJpeg: true },
  og: { maxEdge: 1200, quality: 0.85, forceJpeg: true },
  logo: { maxEdge: 512, quality: 0.9, forceJpeg: false },
  favicon: { maxEdge: 256, quality: 0.9, forceJpeg: false },
} as const;

export type CompressPreset = keyof typeof PRESETS;

/**
 * Resize (+ optionally JPEG-compress) in the browser so assets stay Redis-friendly.
 * Logo/favicon keep PNG when possible to preserve transparency.
 */
export async function compressImageForUpload(
  file: File,
  preset: CompressPreset = "photo",
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  // Keep vector favicons/logos as-is.
  if (file.type === "image/svg+xml" || file.type === "image/x-icon") {
    return file;
  }

  const { maxEdge, quality, forceJpeg } = PRESETS[preset];
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  if (forceJpeg || file.type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const keepPng =
    !forceJpeg && (file.type === "image/png" || file.type === "image/webp");
  const mime = keepPng ? "image/png" : "image/jpeg";
  const ext = keepPng ? ".png" : ".jpg";

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, keepPng ? undefined : quality),
  );

  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, ext), {
    type: mime,
    lastModified: Date.now(),
  });
}
