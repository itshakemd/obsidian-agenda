import type { App } from "obsidian";
import { formatEventDateTime } from "../../utils/date";
import { renderInlineFormatting } from "../../utils/markdown";
import type { EventItem } from "../../types";

export interface EventCardProps {
  app: App;
  container: HTMLElement;
  item: EventItem;
  onOpenNote: (path: string) => void;
  onDeleteNote: (item: EventItem) => void;
}

export function renderEventCard(props: EventCardProps): void {
  const { container, item, onOpenNote } = props;

  const card = container.createDiv({ cls: "agenda-card agenda-event-card" });

  const header = card.createDiv({ cls: "agenda-card-header" });
  const title = header.createDiv({ cls: "agenda-card-title", text: item.title });
  title.onclick = () => onOpenNote(item.path);

  const meta = header.createDiv({ cls: "agenda-card-meta" });
  meta.createSpan({ cls: "agenda-event-date-badge", text: formatEventDateTime(item.eventDate, item.eventTime) });

  if (item.description) {
    const body = card.createDiv({ cls: "agenda-card-body" });
    body.innerHTML = renderInlineFormatting(item.description);
  }
}
