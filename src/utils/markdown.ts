import type { App } from "obsidian";
import type { ExtractedImage } from "../types";

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"]);

export function extractImages(app: App, content: string, sourcePath: string): { cleanContent: string; images: ExtractedImage[] } {
  const images: ExtractedImage[] = [];

  let clean = content.replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, linkpath, alt) => {
    const rawPath = linkpath.trim();
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

  clean = clean.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const rawUrl = url.trim();
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("data:image/")) {
      images.push({ src: rawUrl, alt: alt.trim() });
      return "";
    }
    const targetFile = app.metadataCache.getFirstLinkpathDest(rawUrl, sourcePath);
    if (targetFile && IMAGE_EXTENSIONS.has(targetFile.extension.toLowerCase())) {
      const src = app.vault.getResourcePath(targetFile);
      images.push({ src, alt: alt.trim() || targetFile.basename, file: targetFile });
      return "";
    }
    const ext = rawUrl.split(".").pop()?.toLowerCase();
    if (ext && IMAGE_EXTENSIONS.has(ext)) {
      if (targetFile) {
        images.push({ src: app.vault.getResourcePath(targetFile), alt: alt.trim(), file: targetFile });
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
  const parts = text.split(/(#[a-zA-Z0-9_\-]+|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|`[^`]+`)/g);

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
        const a = container.createEl("a", { text: linkMatch[1], href: linkMatch[2] });
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.style.color = "var(--text-accent)";
        a.style.textDecoration = "none";
      } else {
        container.createSpan({ text: part });
      }
    } else if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const code = container.createEl("code", { text: part.slice(1, -1) });
      code.style.background = "var(--background-modifier-hover)";
      code.style.color = "var(--text-normal)";
      code.style.padding = "2px 5px";
      code.style.borderRadius = "4px";
      code.style.fontSize = "12px";
    } else {
      container.createSpan({ text: part });
    }
  }
}
