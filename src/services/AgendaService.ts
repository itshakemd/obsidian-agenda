import { App, TFile, TFolder } from "obsidian";
import type { AgendaSettings } from "../settings";
import type { AgendaItem } from "../types";
import { toDateKey } from "../utils/date";
import { sanitizeFileName } from "../utils/sanitize";

export class AgendaService {
  private app: App;
  private settings: AgendaSettings;
  private agendaFolder = "Agenda";

  constructor(app: App, settings: AgendaSettings) {
    this.app = app;
    this.settings = settings;
  }

  async ensureAgendaFolder(): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(this.agendaFolder);
    if (!folder) {
      await this.app.vault.createFolder(this.agendaFolder);
    }
  }

  private parseTasks(content: string): { hasUnfinished: boolean } {
    const taskRegex = /^\s*-\s*\[([ xX])\]\s*(.*)$/gm;
    let match: RegExpExecArray | null;
    let hasUnfinished = false;
    while ((match = taskRegex.exec(content)) !== null) {
      if (match[1] === " ") {
        hasUnfinished = true;
      }
    }
    return { hasUnfinished };
  }

  private parseLinks(content: string): Array<{ title: string; url: string }> {
    const links: Array<{ title: string; url: string }> = [];
    const wikiRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    let match: RegExpExecArray | null;
    while ((match = wikiRegex.exec(content)) !== null) {
      links.push({
        title: match[2] ? match[2].trim() : match[1].trim(),
        url: match[1].trim(),
      });
    }
    return links;
  }

  async loadAgendaItems(): Promise<AgendaItem[]> {
    const files = this.app.vault.getMarkdownFiles();
    const items: AgendaItem[] = [];

    for (const file of files) {
      const parent = file.parent ? file.parent.path : "";
      if (this.settings.excludedFolders.some((f) => parent === f || parent.startsWith(f + "/"))) {
        continue;
      }

      const content = await this.app.vault.read(file);
      const cache = this.app.metadataCache.getFileCache(file);
      const tags: string[] = [];
      if (cache?.tags) {
        for (const t of cache.tags) {
          tags.push(t.tag.replace(/^#/, ""));
        }
      }

      const { hasUnfinished } = this.parseTasks(content);
      const links = this.parseLinks(content);
      const stat = file.stat;
      const date = new Date(stat.mtime);
      const dateKey = toDateKey(date);

      items.push({
        id: file.path,
        path: file.path,
        folderPath: parent,
        title: file.basename,
        date,
        dateKey,
        content,
        tags: Array.from(new Set(tags)),
        file,
        hasUnfinishedTasks: hasUnfinished,
        links,
      });
    }

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items;
  }

  async saveAgendaItem(text: string): Promise<TFile> {
    await this.ensureAgendaFolder();
    const timestamp = Date.now();
    const firstLine = text.trim().split("\n")[0] || "Agenda Item";
    const sanitized = sanitizeFileName(firstLine).slice(0, 40) || `Agenda ${timestamp}`;
    const filePath = `${this.agendaFolder}/${sanitized} ${timestamp}.md`;
    const created = await this.app.vault.create(filePath, text);
    return created as TFile;
  }

  async deleteAgendaItem(file: TFile): Promise<void> {
    await this.app.vault.delete(file);
  }
}
