import { statSync } from "node:fs";
import { join } from "node:path";

const MIME_BY_EXT: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp",
	gif: "image/gif",
	avif: "image/avif",
	svg: "image/svg+xml",
};

/** Absolute URL for a cover (site-root path or already-absolute URL). */
export function coverUrl(cover: string, site: string | URL): string {
	return new URL(cover, site).toString();
}

export function coverMime(cover: string): string {
	const ext = (cover.split("?")[0] ?? cover).split(".").pop()?.toLowerCase() ?? "";
	return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

/** Byte size for feeds' enclosure length; 0 when unknown (remote or missing file). */
export function coverBytes(cover: string): number {
	if (!cover.startsWith("/")) return 0;
	try {
		return statSync(join(process.cwd(), "public", cover)).size;
	} catch {
		return 0;
	}
}
