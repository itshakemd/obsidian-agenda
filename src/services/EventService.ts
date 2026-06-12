import { App, TFile, TFolder } from "obsidian";
import type { EventItem } from "../types";

export class EventService {
  private app: App;
  private eventsFolder = "Events";

  constructor(app: App) {
    this.app = app;
  }
}
