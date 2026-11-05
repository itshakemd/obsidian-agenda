import type { App } from "obsidian";
import { renderAgendaCard } from "./AgendaCard";
import { renderEventCard } from "./EventCard";
import type { AgendaItem, EventItem, ViewMode, FeedEntry, ActiveFilter } from "../../types";

const BATCH_SIZE = 15;

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

    if (entries.length === 0) {
      const empty = container.createDiv({ cls: "agenda-feed-empty" });
      empty.createDiv({ cls: "agenda-empty-title", text: "No notes or events found" });
      empty.createDiv({ cls: "agenda-empty-sub", text: "Create a note or adjust filters to see items here." });
      return;
    }

    const modeClass = viewMode === "tile" ? "tile-mode" : "feed-mode";
    const listEl = container.createDiv({ cls: `agenda-feed-entries ${modeClass}` });

    let index = 0;
    const renderBatch = () => {
      const end = Math.min(index + BATCH_SIZE, entries.length);
      for (; index < end; index++) {
        const entry = entries[index];
        if (!entry) continue;
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
      if (index < entries.length) {
        requestAnimationFrame(renderBatch);
      }
    };

    renderBatch();
  }
}
