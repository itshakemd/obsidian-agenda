import type { ExtractedImage } from "../../types";

export function renderImageGallery(
  container: HTMLElement,
  images: ExtractedImage[],
  onOpenFile?: (path: string) => void
): void {
  if (images.length === 0) return;

  const countClass = `count-${Math.min(images.length, 4)}`;
  const gallery = container.createDiv({ cls: `agenda-image-gallery ${countClass}` });

  const displayImages = images.slice(0, 4);
  const remaining = images.length - 4;

  displayImages.forEach((img, idx) => {
    const item = gallery.createDiv({ cls: `agenda-gallery-item item-${idx}` });
    item.title = img.alt ? `${img.alt} (click to open)` : "Click to open image";

    const imageEl = item.createEl("img", { cls: "agenda-gallery-img" });
    imageEl.src = img.src;
    imageEl.alt = img.alt || "Image";
    imageEl.loading = "lazy";

    if (idx === 3 && remaining > 0) {
      const overlay = item.createDiv({ cls: "agenda-gallery-overlay" });
      overlay.createSpan({ text: `+${remaining}` });
    }

    item.onclick = (e) => {
      e.stopPropagation();
      if (img.file && onOpenFile) {
        onOpenFile(img.file.path);
      } else if (img.src.startsWith("http")) {
        window.open(img.src, "_blank");
      }
    };
  });
}

