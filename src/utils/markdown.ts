import type { App } from "obsidian";
import type { ExtractedImage } from "../types";

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"]);

export function extractImages(app: App, content: string, sourcePath: string): { cleanContent: string; images: ExtractedImage[] } {
  const images: ExtractedImage[] = [];

  let clean = content.replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match: string, linkpath: string, alt: string | undefined): string => {
    const rawPath: string = (linkpath ?? "").trim();
    const targetFile = app.metadataCache.getFirstLinkpathDest(rawPath, sourcePath);
    if (targetFile && IMAGE_EXTENSIONS.has(targetFile.extension.toLowerCase())) {
      const src = app.vault.getResourcePath(targetFile);
      images.push({ src, alt: alt ? alt.trim() : targetFile.basename, file: targetFile });
      return "";
    }
    const ext = rawPath.split(".").pop()?.toLowerCase();
    if (ext && IMAGE_EXTENSIONS.has(ext)) {
      if (targetFile) {
        images.push({ src: app.vault.getResourcePath(targetFile), alt: alt ? alt.trim() : rawPath, file: targetFile });
        return "";
      }
    }
    return match;
  });

  clean = clean.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match: string, alt: string, url: string): string => {
    const rawUrl: string = (url ?? "").trim();
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("data:image/")) {
      images.push({ src: rawUrl, alt: (alt ?? "").trim() });
      return "";
    }
    const targetFile = app.metadataCache.getFirstLinkpathDest(rawUrl, sourcePath);
    if (targetFile && IMAGE_EXTENSIONS.has(targetFile.extension.toLowerCase())) {
      const src = app.vault.getResourcePath(targetFile);
      images.push({ src, alt: (alt ?? "").trim() || targetFile.basename, file: targetFile });
      return "";
    }
    const ext = rawUrl.split(".").pop()?.toLowerCase();
    if (ext && IMAGE_EXTENSIONS.has(ext)) {
      if (targetFile) {
        images.push({ src: app.vault.getResourcePath(targetFile), alt: (alt ?? "").trim(), file: targetFile });
        return "";
      }
    }
    return match;
  });

  return { cleanContent: clean.trim(), images };
}

export function isContentLong(cleanContent: string, maxChars = 280, maxLines = 6): boolean {
  if (cleanContent.length > maxChars) return true;
  const nonEmptyLines = cleanContent.split("\n").filter((l) => l.trim().length > 0);
  return nonEmptyLines.length > maxLines;
}

export function renderInlineFormatting(
  container: HTMLElement,
  text: string,
  onTagClick: (tag: string) => void
): void {
  const parts = text.split(/(#[a-zA-Z0-9_-]+|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|`[^`]+`)/g);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith("#") && part.length > 1) {
      const tag = part.slice(1);
      const tagSpan = container.createSpan({ cls: "agenda-inline-tag", text: part });
      tagSpan.onclick = (e) => {
        e.stopPropagation();
        onTagClick(tag);
      };
    } else if (part.startsWith("[") && part.includes("](")) {
      const linkMatch = part.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      if (linkMatch) {
        const a = container.createEl("a", {
          cls: "agenda-inline-link",
          text: linkMatch[1],
          href: linkMatch[2],
        });
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      } else {
        container.createSpan({ text: part });
      }
    } else if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      container.createEl("code", {
        cls: "agenda-inline-code",
        text: part.slice(1, -1),
      });
    } else {
      container.createSpan({ text: part });
    }
  }
}
