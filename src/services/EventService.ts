import { App, TFile, TFolder } from "obsidian";
import type { EventItem } from "../types";

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
}
