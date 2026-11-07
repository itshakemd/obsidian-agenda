import { FilterService } from "../services/FilterService";
import type { AgendaStore } from "./useAgendaStore";
import type AgendaPlugin from "../../main";
import type { ActiveFilter, ViewMode, FeedEntry } from "../types";

export interface FilterHooks {
  setFilter(filter: ActiveFilter, value?: string): void;
  clearFilter(): void;
  selectDate(dayKey: string): void;
  changeMonth(delta: number): void;
  setViewMode(mode: ViewMode): void;
  setShowEventComposer(show: boolean): void;
  isPathExcluded(folderPath: string): boolean;
  toggleFolderExclusion(folderPath: string, excluded: boolean): Promise<void>;
  getFeedEntries(): FeedEntry[];
  getVisibleAgendaCount(): number;
  getUnfinishedCount(): number;
  getUpcomingEventsCount(): number;
  getTagCounts(): Record<string, number>;
  getSortedTags(): { tag: string; count: number }[];
  getDaysWithAgenda(): Set<string>;
  getDaysWithEvents(): Set<string>;
  getFilterTitle(): string;
}

export function useFilter(plugin: AgendaPlugin, store: AgendaStore): FilterHooks {
  function isPathExcluded(folderPath: string): boolean {
    const list = plugin.settings.excludedFolders || [];
    return list.some((excluded) => folderPath === excluded || folderPath.startsWith(`${excluded}/`));
  }

  function setFilter(filter: ActiveFilter, value = ""): void {
    const state = store.getState();
    if (state.activeFilter === filter && state.filterValue === value) {
      store.setState({ activeFilter: "all", filterValue: "" });
    } else {
      store.setState({ activeFilter: filter, filterValue: value });
    }
  }

  function clearFilter(): void {
    store.setState({ activeFilter: "all", filterValue: "" });
  }

  function selectDate(dayKey: string): void {
    const state = store.getState();
    if (state.activeFilter === "date" && state.filterValue === dayKey) {
      store.setState({ activeFilter: "all", filterValue: "" });
    } else {
      store.setState({ activeFilter: "date", filterValue: dayKey });
    }
  }

  function changeMonth(delta: number): void {
    const { calendarDate } = store.getState();
    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1);
    store.setState({ calendarDate: newDate });
  }

  function setViewMode(mode: ViewMode): void {
    if (store.getState().viewMode !== mode) {
      store.setState({ viewMode: mode });
    }
  }

  function setShowEventComposer(show: boolean): void {
    if (store.getState().showEventComposer !== show) {
      store.setState({ showEventComposer: show });
    }
  }

  async function toggleFolderExclusion(folderPath: string, excluded: boolean): Promise<void> {
    const list = plugin.settings.excludedFolders || [];
    if (!excluded) {
      plugin.settings.excludedFolders = list.filter((p) => p !== folderPath);
    } else {
      if (!list.includes(folderPath)) {
        plugin.settings.excludedFolders = [...list, folderPath];
      }
    }
    await plugin.saveSettings();
    store.notify();
  }


  function getFeedEntries(): FeedEntry[] {
    const state = store.getState();
    return FilterService.getFeedEntries(
      state.agendaItems,
      state.events,
      state.activeFilter,
      state.filterValue,
      isPathExcluded
    );
  }

  function getVisibleAgendaCount(): number {
    const state = store.getState();
    return FilterService.getVisibleAgendaItems(state.agendaItems, isPathExcluded).length;
  }

  function getUnfinishedCount(): number {
    const state = store.getState();
    return FilterService.getUnfinishedCount(state.agendaItems, isPathExcluded);
  }

  function getUpcomingEventsCount(): number {
    const state = store.getState();
    return FilterService.getUpcomingEventsCount(state.events);
  }

  function getTagCounts(): Record<string, number> {
    const state = store.getState();
    return FilterService.getTagCounts(state.agendaItems, isPathExcluded);
  }

  function getSortedTags(): { tag: string; count: number }[] {
    const counts = getTagCounts();
    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .map((tag) => ({ tag, count: counts[tag] }));
  }

  function getDaysWithAgenda(): Set<string> {
    const state = store.getState();
    return FilterService.getDaysWithAgenda(state.agendaItems, isPathExcluded);
  }

  function getDaysWithEvents(): Set<string> {
    const state = store.getState();
    return FilterService.getDaysWithEvents(state.events);
  }

  function getFilterTitle(): string {
    const { activeFilter, filterValue } = store.getState();
    switch (activeFilter) {
      case "all":
        return "Agenda";
      case "unfinished":
        return "Unfinished";
      case "events":
        return "Events";
      case "tag":
        return `Tag: #${filterValue}`;
      case "folder":
        return `Folder: ${filterValue}`;
      case "date": {
        const [y, m, d] = filterValue.split("-");
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return dateObj.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
      }
      default:
        return "Agenda";
    }
  }

  return {
    setFilter,
    clearFilter,
    selectDate,
    changeMonth,
    setViewMode,
    setShowEventComposer,
    isPathExcluded,
    toggleFolderExclusion,
    getFeedEntries,
    getVisibleAgendaCount,
    getUnfinishedCount,
    getUpcomingEventsCount,
    getTagCounts,
    getSortedTags,
    getDaysWithAgenda,
    getDaysWithEvents,
    getFilterTitle,
  };
}
