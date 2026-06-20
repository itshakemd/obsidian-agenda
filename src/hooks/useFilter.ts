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
  getFilteredEntries(): FeedEntry[];
  isPathExcluded(path: string): boolean;
  toggleExcludeFolder(folderPath: string, excluded: boolean): Promise<void>;
}

export function useFilter(store: AgendaStore, plugin: AgendaPlugin): FilterHooks {
  const isPathExcluded = (path: string) => {
    return plugin.settings.excludedFolders.some((f) => path === f || path.startsWith(f + "/"));
  };

  const toggleExcludeFolder = async (folderPath: string, excluded: boolean) => {
    const set = new Set(plugin.settings.excludedFolders);
    if (excluded) {
      set.add(folderPath);
    } else {
      set.delete(folderPath);
    }
    plugin.settings.excludedFolders = Array.from(set);
    await plugin.saveSettings();
    store.setState({});
  };

  const setFilter = (filter: ActiveFilter, value = "") => {
    store.setState({ activeFilter: filter, filterValue: value });
  };

  const clearFilter = () => {
    store.setState({ activeFilter: "all", filterValue: "" });
  };

  const selectDate = (dayKey: string) => {
    const s = store.getState();
    if (s.activeFilter === "date" && s.filterValue === dayKey) {
      clearFilter();
    } else {
      setFilter("date", dayKey);
    }
  };

  const changeMonth = (delta: number) => {
    const current = store.getState().calendarDate;
    const next = new Date(current.getFullYear(), current.getMonth() + delta, 1);
    store.setState({ calendarDate: next });
  };

  const setViewMode = (mode: ViewMode) => {
    store.setState({ viewMode: mode });
  };

  const getFilteredEntries = (): FeedEntry[] => {
    const s = store.getState();
    return FilterService.getFeedEntries(s.agendaItems, s.events, s.activeFilter, s.filterValue, isPathExcluded);
  };

  return {
    setFilter,
    clearFilter,
    selectDate,
    changeMonth,
    setViewMode,
    getFilteredEntries,
    isPathExcluded,
    toggleExcludeFolder,
  };
}
