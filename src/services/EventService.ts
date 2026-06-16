import { App, TFile, TFolder } from "obsidian";
import type { EventItem } from "../types";
import { toDateKey } from "../utils/date";

export class EventService {
  private app: App;
  private eventsFolder = "Events";

  constructor(app: App) {
    this.app = app;
  }

  async ensureEventsFolder(): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(this.eventsFolder);
    if (!folder) {
      await this.app.vault.createFolder(this.eventsFolder);
    }
  }

  async loadEvents(): Promise<EventItem[]> {
    const folder = this.app.vault.getAbstractFileByPath(this.eventsFolder);
    if (!folder || !(folder instanceof TFolder)) return [];

    const items: EventItem[] = [];
    for (const child of folder.children) {
      if (child instanceof TFile && child.extension === "md") {
        const content = await this.app.vault.read(child);
        const cache = this.app.metadataCache.getFileCache(child);
        const fm = cache?.frontmatter;

        const stat = child.stat;
        const fileDate = new Date(stat.mtime);

        let eventDate = fileDate;
        let eventDateKey = toDateKey(fileDate);
        let eventTime: string | null = null;
        let title = child.basename;

        if (fm) {
          if (fm["event-title"]) title = String(fm["event-title"]);
          if (fm["event-date"]) {
            eventDateKey = String(fm["event-date"]);
            const parts = eventDateKey.split("-").map((x) => parseInt(x, 10));
            if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
              eventDate = new Date(parts[0], parts[1] - 1, parts[2]);
            }
          }
          if (fm["event-time"]) eventTime = String(fm["event-time"]);
        }

        const tags: string[] = [];
        if (cache?.tags) {
          for (const t of cache.tags) {
            tags.push(t.tag.replace(/^#/, ""));
          }
        }

        const desc = content.replace(/^---[\s\S]*?---\n?/, "").trim();

        items.push({
          id: child.path,
          path: child.path,
          title,
          date: fileDate,
          dateKey: toDateKey(fileDate),
          eventDate,
          eventDateKey,
          eventTime,
          description: desc,
          file: child,
          tags: Array.from(new Set(tags)),
        });
      }
    }

    items.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
    return items;
  }
}
