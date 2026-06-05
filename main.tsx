import { Plugin } from "obsidian";
import { AgendaView, AGENDAVIEW_VIEW_TYPE } from "./src/view/AgendaView";

export default class AgendaPlugin extends Plugin {
  async onload(): Promise<void> {
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
}
