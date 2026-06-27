import type { App } from "obsidian";
import { renderAgendaCard } from "./AgendaCard";
import { renderEventCard } from "./EventCard";
import type { AgendaItem, EventItem, ViewMode, FeedEntry, ActiveFilter } from "../../types";

export interface FeedListProps {
  app: App;
  container: HTMLElement;
  entries: FeedEntry[];
  activeFilter: ActiveFilter;
  filterValue: string;
  viewMode: ViewMode;
  onOpenNote: (path: string, inTab?: boolean) => void;
  onDeleteAgenda: (item: AgendaItem) => void;
  onDeleteEvent: (item: EventItem) => void;
  onToggleTask: (item: AgendaItem, lineIndex: number, isChecked: boolean) => void;
  onClearFilter: () => void;
}

export class FeedListComponent {
  private props: FeedListProps;

  constructor(props: FeedListProps) {
    this.props = props;
    this.render();
  }

  update(props: FeedListProps): void {
    this.props = props;
    this.render();
  }

  private render(): void {
    const { app, container, entries, viewMode, onOpenNote, onDeleteAgenda, onDeleteEvent, onToggleTask } = this.props;
    container.empty();

    const modeClass = viewMode === "tile" ? "tile-mode" : "feed-mode";
    const listEl = container.createDiv({ cls: `agenda-feed-entries ${modeClass}` });

    for (const entry of entries) {
      if (entry.type === "agenda") {
        renderAgendaCard({
          app,
          container: listEl,
          item: entry.item,
          onOpenNote,
          onDeleteNote: onDeleteAgenda,
          onToggleTask,
        });
      } else {
        renderEventCard({
          app,
          container: listEl,
          item: entry.item,
          onOpenNote,
          onDeleteNote: onDeleteEvent,
        });
      }
    }
  }
}
