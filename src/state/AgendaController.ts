import type { App } from "obsidian";
import type AgendaPlugin from "../../main";
import { AgendaStore, type StateListener } from "../hooks/useAgendaStore";
import { useAgendaActions, type AgendaActions } from "../hooks/useAgendaActions";
import { useEventActions, type EventActions } from "../hooks/useEventActions";
import { useFilter, type FilterHooks } from "../hooks/useFilter";
import { useWorkspace, type WorkspaceHooks } from "../hooks/useWorkspace";
import { AgendaService } from "../services/AgendaService";
import { EventService } from "../services/EventService";
import type { AgendaItem, EventItem, ActiveFilter, ViewMode, FolderCount, FeedEntry } from "../types";

export class AgendaController {
  private store: AgendaStore;
  private agendaActions: AgendaActions;
  private eventActions: EventActions;
  private filterHooks: FilterHooks;
  private workspaceHooks: WorkspaceHooks;
  private agendaService: AgendaService;
  private eventService: EventService;

  constructor(app: App, plugin: AgendaPlugin) {
    this.store = new AgendaStore();
    this.agendaActions = useAgendaActions(app, this.store);
    this.eventActions = useEventActions(app, this.store);
    this.filterHooks = useFilter(plugin, this.store);
    this.workspaceHooks = useWorkspace(app);
    this.agendaService = new AgendaService(app);
    this.eventService = new EventService(app);
  }


  get agendaItems(): AgendaItem[] {
    return this.store.getState().agendaItems;
  }

  get events(): EventItem[] {
    return this.store.getState().events;
  }

  get activeFilter(): ActiveFilter {
    return this.store.getState().activeFilter;
  }

  get filterValue(): string {
    return this.store.getState().filterValue;
  }

  get calendarDate(): Date {
    return this.store.getState().calendarDate;
  }

  get showEventComposer(): boolean {
    return this.store.getState().showEventComposer;
  }

  get viewMode(): ViewMode {
    return this.store.getState().viewMode;
  }

  get folders(): FolderCount[] {
    return this.store.getState().folders;
  }


  subscribe(listener: StateListener): () => void {
    return this.store.subscribe(listener);
  }

  notify(): void {
    this.store.notify();
  }


  async initialize(): Promise<void> {
    await this.agendaService.ensureAgendaFolder();
    await this.eventService.ensureEventsFolder();
    await this.reloadAllData();
  }

  async reloadAllData(): Promise<void> {
    const agendaItems = await this.agendaService.loadAgendaItems();
    const events = await this.eventService.loadEvents();
    const folders = this.agendaService.getVaultFolders();
    this.store.setState({ agendaItems, events, folders });
  }

  async reloadAgenda(): Promise<void> {
    await this.agendaActions.reloadAgenda();
  }

  async reloadEvents(): Promise<void> {
    await this.eventActions.reloadEvents();
  }


  setFilter(filter: ActiveFilter, value = ""): void {
    this.filterHooks.setFilter(filter, value);
  }

  clearFilter(): void {
    this.filterHooks.clearFilter();
  }

  selectDate(dayKey: string): void {
    this.filterHooks.selectDate(dayKey);
  }

  changeMonth(delta: number): void {
    this.filterHooks.changeMonth(delta);
  }

  setViewMode(mode: ViewMode): void {
    this.filterHooks.setViewMode(mode);
  }

  setShowEventComposer(show: boolean): void {
    this.filterHooks.setShowEventComposer(show);
  }

  getFilterTitle(): string {
    return this.filterHooks.getFilterTitle();
  }

  isPathExcluded = (folderPath: string): boolean => {
    return this.filterHooks.isPathExcluded(folderPath);
  };

  async toggleFolderExclusion(folderPath: string, excluded: boolean): Promise<void> {
    await this.filterHooks.toggleFolderExclusion(folderPath, excluded);
  }


  async createAgendaItemWithValidation(text: string): Promise<boolean> {
    return this.agendaActions.createAgendaItem(text);
  }

  async deleteAgendaItem(item: AgendaItem): Promise<void> {
    await this.agendaActions.deleteAgendaItem(item);
  }

  async toggleTask(item: AgendaItem, lineIndex: number, isChecked: boolean): Promise<void> {
    await this.agendaActions.toggleTask(item, lineIndex, isChecked);
  }


  async createEventWithValidation(
    title: string,
    eventDate: string,
    eventTime: string,
    description: string
  ): Promise<boolean> {
    return this.eventActions.createEvent(title, eventDate, eventTime, description);
  }

  async deleteEvent(event: EventItem): Promise<void> {
    await this.eventActions.deleteEvent(event);
  }


  openNote(path: string, inTab = true): void {
    this.workspaceHooks.openNote(path, inTab);
  }

  async copyTextToClipboard(text: string, noticeMsg = "Copied to clipboard"): Promise<void> {
    await this.workspaceHooks.copyText(text, noticeMsg);
  }

  async copyEventToClipboard(event: EventItem): Promise<void> {
    await this.workspaceHooks.copyEvent(event);
  }


  getFeedEntries(): FeedEntry[] {
    return this.filterHooks.getFeedEntries();
  }

  getVisibleAgendaCount(): number {
    return this.filterHooks.getVisibleAgendaCount();
  }

  getUnfinishedCount(): number {
    return this.filterHooks.getUnfinishedCount();
  }

  getUpcomingEventsCount(): number {
    return this.filterHooks.getUpcomingEventsCount();
  }

  getTagCounts(): Record<string, number> {
    return this.filterHooks.getTagCounts();
  }

  getSortedTags(): { tag: string; count: number }[] {
    return this.filterHooks.getSortedTags();
  }

  getDaysWithAgenda(): Set<string> {
    return this.filterHooks.getDaysWithAgenda();
  }

  getDaysWithEvents(): Set<string> {
    return this.filterHooks.getDaysWithEvents();
  }

  getSidebarData(): any {
    return {
      calendarDate: this.calendarDate,
      daysWithAgenda: this.getDaysWithAgenda(),
      daysWithEvents: this.getDaysWithEvents(),
      allCount: this.getVisibleAgendaCount(),
      unfinishedCount: this.getUnfinishedCount(),
      upcomingEventsCount: this.getUpcomingEventsCount(),
      folders: this.folders,
      tags: this.getSortedTags(),
      activeFilter: this.activeFilter,
      filterValue: this.filterValue,
      isPathExcluded: this.isPathExcluded,
      onSelectBrand: () => this.clearFilter(),
      onNewEntryClick: () => this.setShowEventComposer(false),
      onSelectDate: (k: string) => this.selectDate(k),
      onChangeMonth: (d: number) => this.changeMonth(d),
      onSelectFilter: (f: any) => this.setFilter(f),
      onToggleExclude: (p: string, e: boolean) => this.toggleFolderExclusion(p, e),
      onSelectFolder: (p: string) => this.setFilter("folder", p),
      onSelectTag: (t: string) => this.setFilter("tag", t),
    };
  }
}
