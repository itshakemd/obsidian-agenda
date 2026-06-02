import { ItemView, type WorkspaceLeaf } from "obsidian";
import type AgendaPlugin from "../../main";

export const AGENDAVIEW_VIEW_TYPE = "agenda-view";

export class AgendaView extends ItemView {
  plugin: AgendaPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: AgendaPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return AGENDAVIEW_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Agenda";
  }

  getIcon(): string {
    return "calendar";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.createEl("h4", { text: "Agenda View" });
  }

  async onClose(): Promise<void> {}
}
