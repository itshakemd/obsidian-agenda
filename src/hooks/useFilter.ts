import { FilterService } from "../services/FilterService";
import type { AgendaStore } from "./useAgendaStore";
import type AgendaPlugin from "../../main";
import type { ActiveFilter, ViewMode, FeedEntry } from "../types";

export interface FilterHooks {
  setFilter(filter: ActiveFilter, value?: string): void;
  clearFilter(): void;
  selectDate(dayKey: string): void;
  setViewMode(mode: ViewMode): void;
  getFilteredEntries(): FeedEntry[];
}

export function useFilter(store: AgendaStore, plugin: AgendaPlugin): FilterHooks {
  const isPathExcluded = (path: string) => {
    return plugin.settings.excludedFolders.some((f) => path === f || path.startsWith(f + "/"));
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
    setViewMode,
    getFilteredEntries,
  };
}
