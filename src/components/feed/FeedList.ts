import type { App } from "obsidian";
import { renderAgendaCard } from "./AgendaCard";
import { renderEventCard } from "./EventCard";
import type { AgendaItem, EventItem, ViewMode, FeedEntry, ActiveFilter } from "../../types";

export interface FeedListProps {
  app: App;
  container: HTMLElement;
  entries: FeedEntry[];
  activeFilter: ActiveFilter;
  viewMode: ViewMode;
  onOpenNote: (path: string, inTab?: boolean) => void;
  onCopyMarkdown: (content: string) => Promise<void>;
  onCopyEvent: (event: EventItem) => Promise<void>;
  onFilterFolder: (folder: string) => void;
  onFilterTag: (tag: string) => void;
  onFilterEvents: () => void;
  onDeleteAgendaItem: (item: AgendaItem) => Promise<void>;
  onDeleteEvent: (event: EventItem) => Promise<void>;
  onToggleTask: (item: AgendaItem, lineIndex: number, isChecked: boolean) => Promise<void>;
}

export class FeedListComponent {
  private props: FeedListProps;
  private feedRenderToken = 0;

  constructor(props: FeedListProps) {
    this.props = props;
    this.render();
  }

  update(entries: FeedEntry[], activeFilter: ActiveFilter, viewMode: ViewMode) {
    this.props.entries = entries;
    this.props.activeFilter = activeFilter;
    this.props.viewMode = viewMode;
    this.render();
  }

  render(props?: FeedListProps) {
    if (props) this.props = props;
    const {
      app,
      container,
      entries,
      activeFilter,
      viewMode,
      onOpenNote,
      onCopyMarkdown,
      onCopyEvent,
      onFilterFolder,
      onFilterTag,
      onFilterEvents,
      onDeleteAgendaItem,
      onDeleteEvent,
      onToggleTask,
    } = this.props;

    container.empty();
    container.toggleClass("agenda-feed-tile", viewMode === "tile");

    if (entries.length === 0) {
      const empty = container.createDiv({ cls: "agenda-empty-notice" });
      empty.textContent = activeFilter === "events" ? "No events scheduled yet." : "No entries match this view.";
      return;
    }

    this.feedRenderToken++;
    const currentToken = this.feedRenderToken;

    const INITIAL_BATCH = 25;
    const firstBatch = entries.slice(0, INITIAL_BATCH);
    for (const entry of firstBatch) {
      if (entry.type === "agenda") {
        renderAgendaCard({
          app,
          container,
          item: entry.item,
          onOpenNote,
          onCopyMarkdown,
          onFilterFolder,
          onFilterTag,
          onDeleteAgendaItem,
          onToggleTask,
        });
      } else {
        renderEventCard({
          app,
          container,
          event: entry.item,
          onOpenNote,
          onCopyEvent,
          onFilterEvents,
          onFilterTag,
          onDeleteEvent,
        });
      }
    }

    if (entries.length > INITIAL_BATCH) {
      let index = INITIAL_BATCH;
      const CHUNK_SIZE = 20;
      const renderChunk = () => {
        if (this.feedRenderToken !== currentToken || !container) return;
        const nextBatch = entries.slice(index, index + CHUNK_SIZE);
        for (const entry of nextBatch) {
          if (entry.type === "agenda") {
            renderAgendaCard({
              app,
              container,
              item: entry.item,
              onOpenNote,
              onCopyMarkdown,
              onFilterFolder,
              onFilterTag,
              onDeleteAgendaItem,
              onToggleTask,
            });
          } else {
            renderEventCard({
              app,
              container,
              event: entry.item,
              onOpenNote,
              onCopyEvent,
              onFilterEvents,
              onFilterTag,
              onDeleteEvent,
            });
          }
        }
        index += CHUNK_SIZE;
        if (index < entries.length) {
          window.requestAnimationFrame(renderChunk);
        }
      };
      window.requestAnimationFrame(renderChunk);
    }
  }
}
