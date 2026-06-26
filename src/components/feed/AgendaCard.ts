import type { App } from "obsidian";
import { formatAgendaTime } from "../../utils/date";
import { renderInlineFormatting } from "../../utils/markdown";
import type { AgendaItem } from "../../types";

export interface AgendaCardProps {
  app: App;
  container: HTMLElement;
  item: AgendaItem;
  onOpenNote: (path: string) => void;
  onDeleteNote: (item: AgendaItem) => void;
}

export function renderAgendaCard(props: AgendaCardProps): void {
  const { container, item, onOpenNote, onDeleteNote } = props;

  const card = container.createDiv({ cls: "agenda-card" });

  const header = card.createDiv({ cls: "agenda-card-header" });
  const title = header.createDiv({ cls: "agenda-card-title", text: item.title });
  title.onclick = () => onOpenNote(item.path);

  const meta = header.createDiv({ cls: "agenda-card-meta" });
  meta.createSpan({ cls: "agenda-card-time", text: formatAgendaTime(item.date) });

  const body = card.createDiv({ cls: "agenda-card-body" });
  body.innerHTML = renderInlineFormatting(item.content);
}
