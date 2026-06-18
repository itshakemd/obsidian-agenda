import { toDateKey } from "../utils/date";
import type { AgendaItem, EventItem, ActiveFilter, FeedEntry } from "../types";

export class FilterService {
  static getFeedEntries(
    agendaItems: AgendaItem[],
    events: EventItem[],
    activeFilter: ActiveFilter,
    filterValue: string,
    isPathExcluded: (path: string) => boolean
  ): FeedEntry[] {
    let entries: FeedEntry[] = [];

    const allAgenda = agendaItems
      .filter((m) => !isPathExcluded(m.folderPath))
      .map((m) => ({ type: "agenda" as const, item: m, sortDate: m.date }));
    const allEvents = events.map((ev) => ({ type: "event" as const, item: ev, sortDate: ev.date }));
    entries = [...allAgenda, ...allEvents];

    entries.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
    return entries;
  }

  static getVisibleAgendaItems(agendaItems: AgendaItem[], isPathExcluded: (path: string) => boolean): AgendaItem[] {
    return agendaItems.filter((m) => !isPathExcluded(m.folderPath));
  }
}
