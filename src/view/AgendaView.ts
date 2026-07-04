import { ItemView, type WorkspaceLeaf } from "obsidian";
import type AgendaPlugin from "../../main";
import { AgendaController } from "../state/AgendaController";
import { SidebarComponent } from "../components/sidebar/Sidebar";
import { AgendaComposerComponent } from "../components/composer/AgendaComposer";
import { EventComposerComponent } from "../components/composer/EventComposer";
import { FilterBarComponent } from "../components/feed/FilterBar";
import { FeedListComponent } from "../components/feed/FeedList";

export const AGENDAVIEW_VIEW_TYPE = "agenda-view";

export class AgendaView extends ItemView {
  plugin: AgendaPlugin;
  private controller: AgendaController;
  private unsubscribe: (() => void) | null = null;

  private sidebarComp: SidebarComponent | null = null;
  private agendaComposerComp: AgendaComposerComponent | null = null;
  private filterBarComp: FilterBarComponent | null = null;
  private feedListComp: FeedListComponent | null = null;

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

    const composerSlot = mainEl.createDiv({ cls: "agenda-composer-slot" });
    const filterSlot = mainEl.createDiv({ cls: "agenda-filter-slot" });
    const feedSlot = mainEl.createDiv({ cls: "agenda-feed-slot" });

    this.sidebarComp = new SidebarComponent(sidebarEl, this.controller.getSidebarData());

    this.agendaComposerComp = new AgendaComposerComponent({
      container: composerSlot,
      onSubmit: (text) => this.controller.createAgendaItem(text),
      onToggleEventComposer: () => this.controller.toggleEventComposer(),
    });

    this.filterBarComp = new FilterBarComponent(filterSlot, this.controller.getFilterBarData());

    this.feedListComp = new FeedListComponent({
      app: this.plugin.app,
      container: feedSlot,
      entries: this.controller.getFilteredEntries(),
      activeFilter: this.controller.getState().activeFilter,
      filterValue: this.controller.getState().filterValue,
      viewMode: this.controller.getState().viewMode,
      onOpenNote: (path, inTab) => this.controller.openNote(path, inTab),
      onDeleteAgenda: (item) => this.controller.deleteAgendaItem(item),
      onDeleteEvent: (ev) => this.controller.deleteEvent(ev),
      onToggleTask: (item, idx, checked) => this.controller.toggleTask(item, idx, checked),
      onClearFilter: () => this.controller.clearFilter(),
    });

    this.unsubscribe = this.controller.subscribe(() => {
      this.sidebarComp?.update(this.controller.getSidebarData());
      this.filterBarComp?.update(this.controller.getFilterBarData());
      this.feedListComp?.update({
        app: this.plugin.app,
        container: feedSlot,
        entries: this.controller.getFilteredEntries(),
        activeFilter: this.controller.getState().activeFilter,
        filterValue: this.controller.getState().filterValue,
        viewMode: this.controller.getState().viewMode,
        onOpenNote: (path, inTab) => this.controller.openNote(path, inTab),
        onDeleteAgenda: (item) => this.controller.deleteAgendaItem(item),
        onDeleteEvent: (ev) => this.controller.deleteEvent(ev),
        onToggleTask: (item, idx, checked) => this.controller.toggleTask(item, idx, checked),
        onClearFilter: () => this.controller.clearFilter(),
      });
    });

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
