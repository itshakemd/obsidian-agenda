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
  onToggleTask?: (item: AgendaItem, lineIndex: number, isChecked: boolean) => void;
}

export function renderAgendaCard(props: AgendaCardProps): void {
  const { container, item, onOpenNote, onToggleTask } = props;

  const card = container.createDiv({ cls: "agenda-card" });

  const header = card.createDiv({ cls: "agenda-card-header" });
  const title = header.createDiv({ cls: "agenda-card-title", text: item.title });
  title.onclick = () => onOpenNote(item.path);

  const meta = header.createDiv({ cls: "agenda-card-meta" });
  meta.createSpan({ cls: "agenda-card-time", text: formatAgendaTime(item.date) });

  const body = card.createDiv({ cls: "agenda-card-body" });
  const lines = item.content.split("\n");
  const taskRegex = /^(\s*)-\s*\[([ xX])\]\s*(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const m = taskRegex.exec(line);
    if (m) {
      const isChecked = m[2]?.toLowerCase() === "x";
      const taskRow = body.createDiv({ cls: `agenda-task-item ${isChecked ? "is-checked" : ""}` });
      const cb = taskRow.createEl("input", { type: "checkbox" });
      cb.checked = isChecked;
      cb.onchange = () => onToggleTask?.(item, i, cb.checked);
      taskRow.createSpan({ cls: "agenda-task-text" }).innerHTML = renderInlineFormatting(m[3] ?? "");
    } else if (line.trim()) {
      body.createDiv({ cls: "agenda-text-line" }).innerHTML = renderInlineFormatting(line);
    }
  }
}
