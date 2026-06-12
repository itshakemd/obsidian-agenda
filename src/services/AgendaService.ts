import { App, TFile, TFolder } from "obsidian";
import type { AgendaSettings } from "../settings";
import type { AgendaItem } from "../types";
import { toDateKey } from "../utils/date";

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

  async loadAgendaItems(): Promise<AgendaItem[]> {
    const files = this.app.vault.getMarkdownFiles();
    const items: AgendaItem[] = [];

    for (const file of files) {
      const parent = file.parent ? file.parent.path : "";
      if (this.settings.excludedFolders.some((f) => parent === f || parent.startsWith(f + "/"))) {
        continue;
      }

      const content = await this.app.vault.read(file);
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
        tags: [],
        file,
        hasUnfinishedTasks: false,
        links: [],
      });
    }

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items;
  }
}
