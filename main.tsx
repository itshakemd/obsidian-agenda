import { Plugin } from "obsidian";

export default class AgendaPlugin extends Plugin {
  async onload(): Promise<void> {
    console.log("Loading Agenda plugin");
  }

  onunload(): void {
    console.log("Unloading Agenda plugin");
  }
}
