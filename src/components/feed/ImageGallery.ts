import type { ExtractedImage } from "../../types";

export function renderImageGallery(
  container: HTMLElement,
  images: ExtractedImage[],
  onOpenFile?: (path: string) => void
): void {
  if (images.length === 0) return;

  const countClass = `count-${Math.min(images.length, 4)}`;
  const gallery = container.createDiv({ cls: `agenda-card-gallery ${countClass}` });

  for (const imgData of images) {
    const itemEl = gallery.createDiv({ cls: "agenda-gallery-item" });
    const imgEl = itemEl.createEl("img", {
      attr: { src: imgData.src, alt: imgData.alt || "Note Image" },
    });
  }
}
