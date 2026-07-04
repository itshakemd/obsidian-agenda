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

    if (activeFilter === "events") {
      entries = events.map((ev) => ({ type: "event", item: ev, sortDate: ev.eventDate }));
    } else if (activeFilter === "unfinished") {
      entries = agendaItems
        .filter((m) => !isPathExcluded(m.folderPath) && m.hasUnfinishedTasks)
        .map((m) => ({ type: "agenda", item: m, sortDate: m.date }));
    } else if (activeFilter === "tag") {
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

  static getUpcomingEventsCount(events: EventItem[]): number {
    const todayKey = toDateKey(new Date());
    return events.filter((ev) => ev.eventDateKey >= todayKey).length;
  }

  static getUnfinishedCount(agendaItems: AgendaItem[], isPathExcluded: (path: string) => boolean): number {
    return agendaItems.filter((m) => !isPathExcluded(m.folderPath) && m.hasUnfinishedTasks).length;
  }

  static getVisibleAgendaItems(agendaItems: AgendaItem[], isPathExcluded: (path: string) => boolean): AgendaItem[] {
    return agendaItems.filter((m) => !isPathExcluded(m.folderPath));
  }

  static getTagCounts(agendaItems: AgendaItem[], isPathExcluded: (path: string) => boolean): Record<string, number> {
    const tagCount: Record<string, number> = {};
    for (const m of agendaItems) {
      if (!isPathExcluded(m.folderPath)) {
        for (const t of m.tags) {
          tagCount[t] = (tagCount[t] || 0) + 1;
        }
      }
    }
    return tagCount;
  }

  static getDaysWithAgenda(agendaItems: AgendaItem[], isPathExcluded: (path: string) => boolean): Set<string> {
    const set = new Set<string>();
    for (const m of agendaItems) {
      if (!isPathExcluded(m.folderPath)) {
        set.add(m.dateKey);
      }
    }
    return set;
  }

  static getDaysWithEvents(events: EventItem[]): Set<string> {
    const set = new Set<string>();
    for (const ev of events) {
      set.add(ev.eventDateKey);
    }
    return set;
  }
}
