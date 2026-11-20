import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, type AgendaSettings } from "./src/settings";
import { AgendaView, AGENDAVIEW_VIEW_TYPE } from "./src/view/AgendaView";
import "./src/App.css";

export default class AgendaPlugin extends Plugin {
  settings: AgendaSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      AGENDAVIEW_VIEW_TYPE,
      (leaf) => new AgendaView(leaf, this)
    );

    const ribbonIconEl = this.addRibbonIcon("calendar", "Open Agenda", () => {
      void this.activateView();
    });
    ribbonIconEl.addClass("agenda-ribbon-icon");

    this.addCommand({
      id: "open-view",
      name: "Open view",
      callback: () => {
        void this.activateView();
      },
    });
  }

  async activateView() {
    const { workspace } = this.app;

    const leaves = workspace.getLeavesOfType(AGENDAVIEW_VIEW_TYPE);
    const leaf = leaves[0] ?? workspace.getLeaf("tab");
    if (leaves.length === 0) {
      await leaf.setViewState({ type: AGENDAVIEW_VIEW_TYPE, active: true });
    }

    workspace.revealLeaf(leaf);
  }

  async loadSettings(): Promise<void> {
    const data = (await this.loadData()) as Partial<AgendaSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
