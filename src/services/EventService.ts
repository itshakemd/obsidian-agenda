import { TFile, type App } from "obsidian";
import { toDateKey } from "../utils/date";
import { sanitizeFileName } from "../utils/sanitize";
import type { EventItem } from "../types";

export class EventService {
  private app: App;
  private readonly eventsFolder = "Events";

  constructor(app: App) {
    this.app = app;
  }

  async ensureEventsFolder(): Promise<void> {
    if (!this.app.vault.getAbstractFileByPath(this.eventsFolder)) {
      try {
        await this.app.vault.createFolder(this.eventsFolder);
      } catch (error) {
        if (!this.app.vault.getAbstractFileByPath(this.eventsFolder)) throw error;
      }
    }
  }

  async loadEvents(): Promise<EventItem[]> {
    await this.ensureEventsFolder();

    const files = this.app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(this.eventsFolder + "/"));
    const items: EventItem[] = [];

    for (const file of files) {
      const content = await this.app.vault.read(file);
      const stat = file.stat;

      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;

      const fm = fmMatch[1];
      const dateMatch = fm.match(/event-date:\s*(.+)/);
      const timeMatch = fm.match(/event-time:\s*(.+)/);
      const titleMatch = fm.match(/event-title:\s*(.+)/);

      if (!dateMatch) continue;

      const eventDateStr = dateMatch[1].trim();
      const eventDate = new Date(eventDateStr + "T00:00:00");
      if (isNaN(eventDate.getTime())) continue;

      const eventTime = timeMatch ? timeMatch[1].trim() : null;
      const eventTitle = titleMatch ? titleMatch[1].trim() : file.basename;
      const description = content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();

      const tagMatches = content.match(/#([a-zA-Z0-9_-]+)/g) || [];
      const tags = Array.from(new Set(tagMatches.map((t) => t.slice(1))));

      const fileDate = new Date(stat.ctime || stat.mtime);

      items.push({
        id: file.path,
        path: file.path,
        title: eventTitle,
        date: fileDate,
        dateKey: toDateKey(fileDate),
        eventDate,
        eventDateKey: toDateKey(eventDate),
        eventTime,
        description,
        file,
        tags,
      });
    }

    items.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
    return items;
  }

  async saveEvent(title: string, eventDate: string, eventTime: string, description: string): Promise<TFile> {
    await this.ensureEventsFolder();
    const timestamp = Date.now();
    const sanitized = sanitizeFileName(title) || `Event ${timestamp}`;
    const filePath = `${this.eventsFolder}/${sanitized} ${timestamp}.md`;

    let fm = `---\nevent-title: ${title}\nevent-date: ${eventDate}`;
    if (eventTime) fm += `\nevent-time: ${eventTime}`;
    fm += `\n---`;

    const fileContent = description ? `${fm}\n\n${description}` : fm;
    const created = await this.app.vault.create(filePath, fileContent);
    if (created instanceof TFile) {
      return created;
    }
    throw new Error("Failed to create event file");
  }

  async deleteEvent(file: TFile): Promise<void> {
    await this.app.fileManager.trashFile(file);
  }
}
