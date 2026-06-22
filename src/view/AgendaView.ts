import { ItemView, type WorkspaceLeaf } from "obsidian";
import type AgendaPlugin from "../../main";
import { AgendaController } from "../state/AgendaController";
import { ICONS } from "../constants/icons";

export const AGENDAVIEW_VIEW_TYPE = "agenda-view";

export class AgendaView extends ItemView {
  plugin: AgendaPlugin;
  private controller: AgendaController;
  private unsubscribe: (() => void) | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: AgendaPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.controller = new AgendaController(plugin.app, plugin);
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
    container.addClass("agenda-view-container");

    const layout = container.createDiv({ cls: "agenda-layout" });
    const sidebarEl = layout.createDiv({ cls: "agenda-sidebar-pane" });
    const mainEl = layout.createDiv({ cls: "agenda-main-pane" });

    mainEl.createEl("h3", { text: "Agenda View" });

    await this.controller.init();
  }

  async onClose(): Promise<void> {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.controller.destroy();
  }
}
