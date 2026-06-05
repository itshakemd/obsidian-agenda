import { Plugin } from "obsidian";
import { AgendaView, AGENDAVIEW_VIEW_TYPE } from "./src/view/AgendaView";

export default class AgendaPlugin extends Plugin {
  settings: any = {};

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      AGENDAVIEW_VIEW_TYPE,
      (leaf) => new AgendaView(leaf, this)
    );

    const ribbonIconEl = this.addRibbonIcon("calendar", "Open Agenda", () => {
      this.activateView();
    });
    ribbonIconEl.addClass("agenda-ribbon-icon");

    this.addCommand({
      id: "open-agenda-view",
      name: "Open Agenda",
      callback: () => {
        this.activateView();
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
    const data = (await this.loadData()) as any;
    this.settings = Object.assign({}, data);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
