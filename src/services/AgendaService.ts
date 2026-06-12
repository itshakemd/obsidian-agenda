import { App, TFile, TFolder } from "obsidian";
import type { AgendaSettings } from "../settings";
import type { AgendaItem } from "../types";

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
}
