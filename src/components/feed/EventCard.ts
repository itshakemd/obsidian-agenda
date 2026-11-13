import { Menu, type App } from "obsidian";
import { ICONS } from "../../constants/icons";
import { formatEventDateTime } from "../../utils/date";
import { extractImages, renderInlineFormatting } from "../../utils/markdown";
import { renderImageGallery } from "./ImageGallery";
import type { EventItem, AgendaItem } from "../../types";

export interface EventCardProps {
  app: App;
  container: HTMLElement;
  event: EventItem;
  onOpenNote: (path: string, inTab?: boolean) => void;
  onCopyEvent: (event: EventItem) => Promise<void>;
  onFilterEvents: () => void;
  onFilterTag: (tag: string) => void;
  onDeleteEvent: (event: EventItem) => Promise<void>;
}

export function renderEventCard(props: EventCardProps): HTMLElement {
  const { app, container, event, onOpenNote, onCopyEvent, onFilterEvents, onFilterTag, onDeleteEvent } = props;
  const card = container.createDiv({ cls: "agenda-card agenda-event-card" });

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
    onOpenNote(event.file.path, true);
  };

  const header = card.createDiv({ cls: "agenda-card-header" });
  const headerLeft = header.createDiv({ cls: "agenda-card-header-left" });

  const eventBadge = headerLeft.createSpan({ cls: "agenda-card-folder-badge agenda-event-type-badge", text: "Event" });
  eventBadge.onclick = (e) => {
    e.stopPropagation();
    onFilterEvents();
  };

  const dateStr = formatEventDateTime(event.eventDate, event.eventTime);
  headerLeft.createSpan({ cls: "agenda-card-time agenda-event-datetime", text: dateStr });

  const headerActions = header.createDiv({ cls: "agenda-card-header-actions" });
  const menuBtn = headerActions.createEl("button", { cls: "agenda-card-menu-btn", title: "More options" });
  menuBtn.innerHTML = ICONS.more;
  menuBtn.onclick = (e) => {
    const menu = new Menu();
    menu.addItem((menuItem) => {
      menuItem
        .setTitle("Open event note in vault")
        .setIcon("file-text")
        .onClick(() => onOpenNote(event.file.path, false));
    });
    menu.addItem((menuItem) => {
      menuItem
        .setTitle("Copy event details")
        .setIcon("copy")
        .onClick(() => onCopyEvent(event));
    });
    menu.addSeparator();
    menu.addItem((menuItem) => {
      menuItem
        .setTitle("Delete event")
        .setIcon("trash")
        .setWarning(true)
        .onClick(async () => onDeleteEvent(event));
    });
    menu.showAtMouseEvent(e);
  };

  const body = card.createDiv({ cls: "agenda-card-body" });
  const titleEl = body.createEl("div", { cls: "agenda-card-note-title agenda-event-title", text: event.title });
  titleEl.onclick = () => onOpenNote(event.file.path, true);

  if (event.description) {
    const { cleanContent, images } = extractImages(app, event.description, event.file.path);
    if (cleanContent) {
      const descEl = body.createDiv({ cls: "agenda-event-description" });
      const agendaProxy: AgendaItem = {
        id: event.id,
        path: event.path,
        folderPath: "Events",
        title: event.title,
        date: event.date,
        dateKey: event.dateKey,
        content: cleanContent,
        tags: event.tags,
        file: event.file,
        hasUnfinishedTasks: false,
        links: [],
      };
      const lines = agendaProxy.content.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        const p = descEl.createEl("p");
        renderInlineFormatting(p, line, onFilterTag);
      }
    }
    if (images.length > 0) {
      renderImageGallery(card, images, (path) => onOpenNote(path, true));
    }
  }

  if (event.tags.length > 0) {
    const footer = card.createDiv({ cls: "agenda-card-footer" });
    const tagsWrapper = footer.createDiv({ cls: "agenda-card-tags" });

    for (const tag of event.tags) {
      if (tag === "public") continue;
      const tagPill = tagsWrapper.createSpan({ cls: "agenda-card-tag-pill", text: `#${tag}` });
      tagPill.onclick = () => onFilterTag(tag);
    }
  }

  return card;
}
