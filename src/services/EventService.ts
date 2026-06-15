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
        const stat = child.stat;
        const fileDate = new Date(stat.mtime);

        items.push({
          id: child.path,
          path: child.path,
          title: child.basename,
          date: fileDate,
          dateKey: toDateKey(fileDate),
          eventDate: fileDate,
          eventDateKey: toDateKey(fileDate),
          eventTime: null,
          description: content,
          file: child,
          tags: [],
        });
      }
    }

    items.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
    return items;
  }
}
