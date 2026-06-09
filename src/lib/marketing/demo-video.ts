/** Optional 3-min executive demo — set NEXT_PUBLIC_DEMO_VIDEO_URL (YouTube/Vimeo). */
export function getDemoVideoUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL?.trim();
  return url || null;
}

export function getDemoVideoEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtu.be") {
      const id = url.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (rawUrl.includes("/embed/")) return rawUrl;
    return null;
  } catch {
    return null;
  }
}
