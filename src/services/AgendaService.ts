import { TFile, TFolder, type App } from "obsidian";
import { toDateKey } from "../utils/date";
import type { AgendaItem, FolderCount } from "../types";

export class AgendaService {
  private app: App;
  private cachedVaultFolders: FolderCount[] | null = null;

  constructor(app: App) {
    this.app = app;
  }

  invalidateFolderCache(): void {
    this.cachedVaultFolders = null;
  }

  async ensureAgendaFolder(): Promise<void> {
    const agendaFolder = this.app.vault.getAbstractFileByPath("Agenda");
    if (!agendaFolder) {
      try {
        await this.app.vault.createFolder("Agenda");
      } catch (error) {
        if (!this.app.vault.getAbstractFileByPath("Agenda")) throw error;
      }
    }
  }

  async loadAgendaItems(): Promise<AgendaItem[]> {
    this.invalidateFolderCache();
    const files = this.app.vault.getMarkdownFiles().filter((f) => !f.path.startsWith("."));
    const items: AgendaItem[] = [];

    for (const file of files) {
      const content = await this.app.vault.read(file);
      const stat = file.stat;

      let itemDate = new Date(stat.ctime || stat.mtime);
      const matchTime = file.basename.match(/\b\d{10,13}\b/);
      if (matchTime) {
        itemDate = new Date(parseInt(matchTime[0], 10));
      }

      const tagMatches = content.match(/#([a-zA-Z0-9_\-]+)/g) || [];
      const tags = Array.from(new Set(tagMatches.map((t) => t.slice(1))));

      const linkMatches = Array.from(content.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g));
      const links = linkMatches.map((m) => ({ title: m[1], url: m[2] }));

      const hasUnfinishedTasks = content.includes("- [ ]");
      const folderPath = file.parent && file.parent.path !== "/" ? file.parent.path : "";

      items.push({
        id: file.path,
        path: file.path,
        folderPath,
        title: file.basename,
        date: itemDate,
        dateKey: toDateKey(itemDate),
        content,
        tags,
        file,
        hasUnfinishedTasks,
        links,
      });
    }

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items;
  }

  async saveAgendaItem(text: string, targetFolder = "Agenda"): Promise<TFile> {
    const timestamp = Date.now();
    const fileName = `Agenda ${timestamp}.md`;
    const folder = targetFolder || "Agenda";
    const filePath = `${folder}/${fileName}`;

    const created = await this.app.vault.create(filePath, text);
    this.invalidateFolderCache();
    return created as TFile;
  }

  async deleteAgendaItem(file: TFile): Promise<void> {
    await this.app.vault.delete(file);
    this.invalidateFolderCache();
  }

  async toggleTask(
    file: TFile,
    content: string,
    lineIndex: number,
    isChecked: boolean
  ): Promise<{ updatedContent: string; hasUnfinishedTasks: boolean }> {
    const lines = content.split("\n");
    const oldLine = lines[lineIndex];
    if (oldLine) {
      lines[lineIndex] = oldLine.replace(/^-\s*\[([ xX])\]/, `- [${isChecked ? "x" : " "}]`);
    }
    const updatedContent = lines.join("\n");
    const hasUnfinishedTasks = updatedContent.includes("- [ ]");

    await this.app.vault.modify(file, updatedContent);
    return { updatedContent, hasUnfinishedTasks };
  }

  getVaultFolders(): FolderCount[] {
    if (this.cachedVaultFolders) return this.cachedVaultFolders;

    const loadedFiles = this.app.vault.getAllLoadedFiles();
    const allMd = this.app.vault.getMarkdownFiles();
    const countMap = new Map<string, number>();

    for (const f of allMd) {
      let p = f.parent;
      while (p && p.path && p.path !== "/") {
        countMap.set(p.path, (countMap.get(p.path) || 0) + 1);
        p = p.parent;
      }
    }

    const result: FolderCount[] = [];
    for (const file of loadedFiles) {
      if (file instanceof TFolder) {
        if (file.path === "/" || file.name.startsWith(".")) continue;
        result.push({
          path: file.path,
          name: file.name,
          count: countMap.get(file.path) || 0,
        });
      }
    }

    this.cachedVaultFolders = result.sort((a, b) => a.path.localeCompare(b.path));
    return this.cachedVaultFolders;
  }

  isPathExcluded(folderPath: string, excludedFolders: string[] = []): boolean {
    if (!excludedFolders || excludedFolders.length === 0) return false;
    for (const p of excludedFolders) {
      if (folderPath === p || folderPath.startsWith(p + "/")) {
        return true;
      }
    }
    return false;
  }
}
