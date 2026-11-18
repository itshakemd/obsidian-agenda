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

  private composerEl: HTMLElement | null = null;
  private eventComposerEl: HTMLElement | null = null;
  private filterBarEl: HTMLElement | null = null;
  private feedContainer: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: AgendaPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.controller = new AgendaController(this.app, plugin);
  }

  getViewType() {
    return AGENDAVIEW_VIEW_TYPE;
  }

  getDisplayText() {
    return "Agenda";
  }

  getIcon() {
    return "calendar";
  }

  async onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("agenda-view-container");

    this.renderLayout();

    this.unsubscribe = this.controller.subscribe(() => {
      this.updateUI();
    });

    await this.controller.initialize();
  }

  private renderLayout() {
    const root = this.contentEl.createDiv({ cls: "agenda-root" });

    this.sidebarComp = new SidebarComponent({
      container: root,
      calendarDate: this.controller.calendarDate,
      daysWithAgenda: this.controller.getDaysWithAgenda(),
      daysWithEvents: this.controller.getDaysWithEvents(),
      allCount: this.controller.getVisibleAgendaCount(),
      unfinishedCount: this.controller.getUnfinishedCount(),
      upcomingEventsCount: this.controller.getUpcomingEventsCount(),
      folders: this.controller.folders,
      tags: this.controller.getSortedTags(),
      activeFilter: this.controller.activeFilter,
      filterValue: this.controller.filterValue,
      isPathExcluded: this.controller.isPathExcluded,
      onSelectBrand: () => this.controller.clearFilter(),
      onNewEntryClick: () => this.agendaComposerComp?.focus(),
      onSelectDate: (dayKey) => this.controller.selectDate(dayKey),
      onChangeMonth: (delta) => this.controller.changeMonth(delta),
      onSelectFilter: (filter) => this.controller.setFilter(filter),
      onToggleExclude: (folderPath, excluded) => this.controller.toggleFolderExclusion(folderPath, excluded),
      onSelectFolder: (folderPath) => this.controller.setFilter("folder", folderPath),
      onSelectTag: (tag) => this.controller.setFilter("tag", tag),
    });

    const main = root.createEl("main", { cls: "agenda-main" });
    const feedWrapper = main.createDiv({ cls: "agenda-feed-wrapper" });

    this.composerEl = feedWrapper.createDiv({ cls: "agenda-composer-area" });
    this.agendaComposerComp = new AgendaComposerComponent({
      container: this.composerEl,
      onSubmit: async (text) => this.controller.createAgendaItemWithValidation(text),
      onToggleEventComposer: () => this.controller.setShowEventComposer(true),
    });

    this.eventComposerEl = feedWrapper.createDiv({ cls: "agenda-event-composer-area" });
    new EventComposerComponent({
      container: this.eventComposerEl,
      onSubmit: async (title, date, time, desc) =>
        this.controller.createEventWithValidation(title, date, time, desc),
      onCancel: () => this.controller.setShowEventComposer(false),
    });
    this.eventComposerEl.style.display = "none";

    this.filterBarEl = feedWrapper.createDiv({ cls: "agenda-filter-bar" });
    this.filterBarComp = new FilterBarComponent({
      container: this.filterBarEl,
      title: this.controller.getFilterTitle(),
      isFiltered: this.controller.activeFilter !== "all",
      viewMode: this.controller.viewMode,
      onClearFilter: () => this.controller.clearFilter(),
      onChangeViewMode: (mode) => this.controller.setViewMode(mode),
    });

    this.feedContainer = feedWrapper.createDiv({ cls: "agenda-feed-list" });
    this.feedListComp = new FeedListComponent({
      app: this.app,
      container: this.feedContainer,
      entries: this.controller.getFeedEntries(),
      activeFilter: this.controller.activeFilter,
      viewMode: this.controller.viewMode,
      onOpenNote: (path, inTab) => this.controller.openNote(path, inTab),
      onCopyMarkdown: async (text) => this.controller.copyTextToClipboard(text),
      onCopyEvent: async (event) => this.controller.copyEventToClipboard(event),
      onFilterFolder: (folder) => this.controller.setFilter("folder", folder),
      onFilterTag: (tag) => this.controller.setFilter("tag", tag),
      onFilterEvents: () => this.controller.setFilter("events"),
      onDeleteAgendaItem: async (item) => this.controller.deleteAgendaItem(item),
      onDeleteEvent: async (event) => this.controller.deleteEvent(event),
      onToggleTask: async (item, lineIndex, isChecked) => this.controller.toggleTask(item, lineIndex, isChecked),
    });
  }

  private updateUI() {
    if (!this.sidebarComp) return;

    this.sidebarComp.update({
      calendarDate: this.controller.calendarDate,
      daysWithAgenda: this.controller.getDaysWithAgenda(),
      daysWithEvents: this.controller.getDaysWithEvents(),
      allCount: this.controller.getVisibleAgendaCount(),
      unfinishedCount: this.controller.getUnfinishedCount(),
      upcomingEventsCount: this.controller.getUpcomingEventsCount(),
      folders: this.controller.folders,
      tags: this.controller.getSortedTags(),
      activeFilter: this.controller.activeFilter,
      filterValue: this.controller.filterValue,
      isPathExcluded: this.controller.isPathExcluded,
      onSelectBrand: () => this.controller.clearFilter(),
      onNewEntryClick: () => this.agendaComposerComp?.focus(),
      onSelectDate: (dayKey) => this.controller.selectDate(dayKey),
      onChangeMonth: (delta) => this.controller.changeMonth(delta),
      onSelectFilter: (filter) => this.controller.setFilter(filter),
      onToggleExclude: (folderPath, excluded) => this.controller.toggleFolderExclusion(folderPath, excluded),
      onSelectFolder: (folderPath) => this.controller.setFilter("folder", folderPath),
      onSelectTag: (tag) => this.controller.setFilter("tag", tag),
    });

    if (this.composerEl && this.eventComposerEl) {
      if (this.controller.showEventComposer) {
        this.composerEl.style.display = "none";
        this.eventComposerEl.style.display = "";
      } else {
        this.composerEl.style.display = "";
        this.eventComposerEl.style.display = "none";
      }
    }

    if (this.filterBarComp) {
      this.filterBarComp.update({
        title: this.controller.getFilterTitle(),
        isFiltered: this.controller.activeFilter !== "all",
        viewMode: this.controller.viewMode,
        onClearFilter: () => this.controller.clearFilter(),
        onChangeViewMode: (mode) => this.controller.setViewMode(mode),
      });
    }

    if (this.feedListComp) {
      this.feedListComp.update(
        this.controller.getFeedEntries(),
        this.controller.activeFilter,
        this.controller.viewMode
      );
    }
  }

  async onClose() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
