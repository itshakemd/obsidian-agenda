import { Menu, type App } from "obsidian";
import { ICONS } from "../../constants/icons";
import { formatAgendaTime } from "../../utils/date";
import { extractImages, renderInlineFormatting, isContentLong } from "../../utils/markdown";
import { renderImageGallery } from "./ImageGallery";
import type { AgendaItem } from "../../types";

export interface AgendaCardProps {
  app: App;
  container: HTMLElement;
  item: AgendaItem;
  onOpenNote: (path: string, inTab?: boolean) => void;
  onCopyMarkdown: (content: string) => Promise<void>;
  onFilterFolder: (folder: string) => void;
  onFilterTag: (tag: string) => void;
  onDeleteAgendaItem: (item: AgendaItem) => Promise<void>;
  onToggleTask: (item: AgendaItem, lineIndex: number, isChecked: boolean) => Promise<void>;
}

export function renderAgendaCard(props: AgendaCardProps): HTMLElement {
  const {
    app,
    container,
    item,
    onOpenNote,
    onCopyMarkdown,
    onFilterFolder,
    onFilterTag,
    onDeleteAgendaItem,
    onToggleTask,
  } = props;

  const card = container.createDiv({ cls: "agenda-card" });

  card.onclick = (e) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest(".agenda-card-tag-pill") ||
      target.closest(".agenda-inline-tag") ||
      target.closest(".agenda-card-folder-badge") ||
      target.closest(".agenda-gallery-item")
    ) {
      return;
    }
    onOpenNote(item.file.path, true);
  };

  const header = card.createDiv({ cls: "agenda-card-header" });
  const headerLeft = header.createDiv({ cls: "agenda-card-header-left" });

  if (item.folderPath && item.folderPath !== "Agenda") {
    const folderBadge = headerLeft.createSpan({ cls: "agenda-card-folder-badge", text: item.folderPath });
    folderBadge.onclick = (e) => {
      e.stopPropagation();
      onFilterFolder(item.folderPath);
    };
  }
  headerLeft.createSpan({ cls: "agenda-card-time", text: formatAgendaTime(item.date) });

  const headerActions = header.createDiv({ cls: "agenda-card-header-actions" });
  const menuBtn = headerActions.createEl("button", { cls: "agenda-card-menu-btn", title: "More options" });
  menuBtn.innerHTML = ICONS.more;
  menuBtn.onclick = (e) => {
    const menu = new Menu();
    menu.addItem((menuItem) => {
      menuItem
        .setTitle("Open note in vault")
        .setIcon("file-text")
        .onClick(() => onOpenNote(item.file.path, true));
    });
    menu.addItem((menuItem) => {
      menuItem
        .setTitle("Copy markdown")
        .setIcon("copy")
        .onClick(() => onCopyMarkdown(item.content));
    });
    menu.addSeparator();
    menu.addItem((menuItem) => {
      menuItem
        .setTitle("Delete note")
        .setIcon("trash")
        .setWarning(true)
        .onClick(async () => onDeleteAgendaItem(item));
    });
    menu.showAtMouseEvent(e);
  };

  const { cleanContent, images } = extractImages(app, item.content, item.file.path);

  const body = card.createDiv({ cls: "agenda-card-body" });
  if (item.title && !item.title.startsWith("Agenda ")) {
    const noteTitle = body.createEl("div", { cls: "agenda-card-note-title", text: item.title });
    noteTitle.onclick = () => onOpenNote(item.file.path, true);
  }

  if (cleanContent) {
    renderAgendaBodyContent(body, item, cleanContent, onFilterTag, onToggleTask);
  }

  const isLong = isContentLong(cleanContent) || body.scrollHeight > 200;
  if (isLong) {
    body.addClass("collapsed");
    const readMoreBtn = card.createEl("button", {
      cls: "agenda-read-more-btn",
      text: "Read more",
      title: "Open in Obsidian tab",
    });
    readMoreBtn.onclick = () => onOpenNote(item.file.path, true);
  }

  if (images.length > 0) {
    renderImageGallery(card, images, (path) => onOpenNote(path, true));
  }

  if (item.tags.length > 0) {
    const footer = card.createDiv({ cls: "agenda-card-footer" });
    const tagsWrapper = footer.createDiv({ cls: "agenda-card-tags" });

    for (const tag of item.tags) {
      if (tag === "public") continue;
      const tagPill = tagsWrapper.createSpan({ cls: "agenda-card-tag-pill", text: `#${tag}` });
      tagPill.onclick = () => onFilterTag(tag);
    }
  }

  return card;
}

function renderAgendaBodyContent(
  container: HTMLElement,
  item: AgendaItem,
  cleanContent: string,
  onTagClick: (tag: string) => void,
  onToggleTask: (item: AgendaItem, lineIndex: number, isChecked: boolean) => Promise<void>
) {
  const lines = cleanContent.split("\n");

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line) continue;

    const taskMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      const isChecked = taskMatch[1].toLowerCase() === "x";
      const taskText = taskMatch[2];

      const taskRow = container.createDiv({ cls: "agenda-card-task-item" });
      const checkbox = taskRow.createEl("input", { cls: "agenda-card-task-checkbox", type: "checkbox" });
      checkbox.checked = isChecked;

      const textSpan = taskRow.createSpan({ cls: isChecked ? "agenda-task-checked" : "" });
      renderInlineFormatting(textSpan, taskText, onTagClick);

      checkbox.onchange = async () => {
        const newChecked = checkbox.checked;
        textSpan.toggleClass("agenda-task-checked", newChecked);
        await onToggleTask(item, lineIndex, newChecked);
      };
      continue;
    }

    const fullLinkMatch = line.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (fullLinkMatch) {
      const linkCard = container.createEl("a", {
        cls: "agenda-link-card",
        href: fullLinkMatch[2],
      });
      linkCard.target = "_blank";
      linkCard.rel = "noopener noreferrer";

      const iconBox = linkCard.createDiv({ cls: "agenda-link-icon-box" });
      iconBox.innerHTML = ICONS.link;

      const info = linkCard.createDiv({ cls: "agenda-link-info" });
      info.createSpan({ cls: "agenda-link-title", text: fullLinkMatch[1] });
      info.createSpan({ cls: "agenda-link-url", text: fullLinkMatch[2] });
      continue;
    }

    const p = container.createEl("p");
    renderInlineFormatting(p, line, onTagClick);
  }
}
