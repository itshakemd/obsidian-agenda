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

    if (activeFilter === "tag") {
      const tagAgenda = agendaItems
        .filter((m) => !isPathExcluded(m.folderPath) && m.tags.includes(filterValue))
        .map((m) => ({ type: "agenda" as const, item: m, sortDate: m.date }));
      const tagEvents = events
        .filter((ev) => ev.tags.includes(filterValue))
        .map((ev) => ({ type: "event" as const, item: ev, sortDate: ev.eventDate }));
      entries = [...tagAgenda, ...tagEvents];
    } else if (activeFilter === "date") {
      const dateAgenda = agendaItems
        .filter((m) => !isPathExcluded(m.folderPath) && m.dateKey === filterValue)
        .map((m) => ({ type: "agenda" as const, item: m, sortDate: m.date }));
      const dateEvents = events
        .filter((ev) => ev.eventDateKey === filterValue)
        .map((ev) => ({ type: "event" as const, item: ev, sortDate: ev.eventDate }));
      entries = [...dateAgenda, ...dateEvents];
    } else if (activeFilter === "folder") {
      entries = agendaItems
        .filter((m) => m.folderPath === filterValue || m.path.startsWith(filterValue + "/"))
        .map((m) => ({ type: "agenda", item: m, sortDate: m.date }));
      if (filterValue === "Events") {
        entries.push(...events.map((ev) => ({ type: "event" as const, item: ev, sortDate: ev.date })));
      }
    } else {
      const allAgenda = agendaItems
        .filter((m) => !isPathExcluded(m.folderPath))
        .map((m) => ({ type: "agenda" as const, item: m, sortDate: m.date }));
      const allEvents = events.map((ev) => ({ type: "event" as const, item: ev, sortDate: ev.date }));
      entries = [...allAgenda, ...allEvents];
    }

    entries.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
    return entries;
  }

  static getVisibleAgendaItems(agendaItems: AgendaItem[], isPathExcluded: (path: string) => boolean): AgendaItem[] {
    return agendaItems.filter((m) => !isPathExcluded(m.folderPath));
  }
}
