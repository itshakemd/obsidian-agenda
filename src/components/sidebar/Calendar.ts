import { ICONS } from "../../constants/icons";
import { buildCalendarGrid } from "../../utils/calendar";

export interface CalendarData {
  calendarDate: Date;
  daysWithAgenda: Set<string>;
  daysWithEvents: Set<string>;
  activeFilter: string;
  filterValue: string;
  onSelectDate: (dateKey: string) => void;
  onChangeMonth: (delta: number) => void;
}

export class CalendarComponent {
  private container: HTMLElement;
  private data: CalendarData;

  constructor(container: HTMLElement, data: CalendarData) {
    this.container = container;
    this.data = data;
    this.render();
  }

  update(data: CalendarData): void {
    this.data = data;
    this.render();
  }

  private render(): void {
    this.container.empty();
    const cal = this.container.createDiv({ cls: "agenda-calendar" });

    const gridData = buildCalendarGrid(
      this.data.calendarDate,
      this.data.daysWithAgenda,
      this.data.daysWithEvents,
      this.data.activeFilter,
      this.data.filterValue
    );

    const header = cal.createDiv({ cls: "agenda-cal-header" });
    header.createSpan({ cls: "agenda-cal-title", text: gridData.monthTitle });

    const btns = header.createDiv({ cls: "agenda-cal-nav" });
    const prev = btns.createEl("button", { cls: "agenda-cal-btn" });
    prev.innerHTML = ICONS.prev;
    prev.onclick = () => this.data.onChangeMonth(-1);

    const next = btns.createEl("button", { cls: "agenda-cal-btn" });
    next.innerHTML = ICONS.next;
    next.onclick = () => this.data.onChangeMonth(1);

    const grid = cal.createDiv({ cls: "agenda-cal-grid" });
    for (let i = 0; i < gridData.firstDayIndex; i++) {
      grid.createDiv({ cls: "agenda-cal-empty" });
    }

    for (const d of gridData.days) {
      const dayEl = grid.createDiv({ cls: "agenda-cal-day" });
      dayEl.createSpan({ text: String(d.dayNumber) });
      dayEl.onclick = () => this.data.onSelectDate(d.dateKey);
    }
  }
}
