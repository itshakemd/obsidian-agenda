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

export interface CalendarProps extends CalendarData {
  container: HTMLElement;
}

export class CalendarComponent {
  private container: HTMLElement;
  private data: CalendarData;
  private titleEl: HTMLElement | null = null;
  private gridEl: HTMLElement | null = null;

  constructor(props: CalendarProps) {
    this.container = props.container;
    this.data = props;
    this.render();
  }

  private render() {
    const calCard = this.container.createDiv({ cls: "agenda-calendar-card" });
    const calHeader = calCard.createDiv({ cls: "agenda-cal-header" });
    this.titleEl = calHeader.createSpan({ cls: "agenda-cal-title" });

    const calNav = calHeader.createDiv({ cls: "agenda-cal-nav" });
    const prevBtn = calNav.createEl("button", { cls: "agenda-cal-btn prev", title: "Previous Month" });
    prevBtn.innerHTML = ICONS.prev;
    prevBtn.onclick = () => this.data.onChangeMonth(-1);

    const nextBtn = calNav.createEl("button", { cls: "agenda-cal-btn next", title: "Next Month" });
    nextBtn.innerHTML = ICONS.next;
    nextBtn.onclick = () => this.data.onChangeMonth(1);

    const weekdays = calCard.createDiv({ cls: "agenda-cal-weekdays" });
    ["S", "M", "T", "W", "T", "F", "S"].forEach((w) => weekdays.createSpan({ text: w }));

    this.gridEl = calCard.createDiv({ cls: "agenda-cal-days" });
    this.update(this.data);
  }

  update(data: CalendarData) {
    this.data = data;
    if (!this.gridEl || !this.titleEl) return;
    this.gridEl.empty();

    const gridData = buildCalendarGrid(
      this.data.calendarDate,
      this.data.daysWithAgenda,
      this.data.daysWithEvents,
      this.data.activeFilter,
      this.data.filterValue
    );

    this.titleEl.textContent = gridData.monthTitle;

    for (let i = 0; i < gridData.firstDayIndex; i++) {
      const emptyCell = this.gridEl.createDiv({ cls: "agenda-cal-day empty" });
      emptyCell.innerHTML = "&nbsp;";
    }

    for (const day of gridData.days) {
      const dayCell = this.gridEl.createDiv({ cls: "agenda-cal-day" });
      dayCell.textContent = String(day.dayNumber);

      if (day.hasAgenda) dayCell.addClass("has-agenda");
      if (day.hasEvent) dayCell.addClass("has-event");
      if (day.isToday) dayCell.addClass("is-today");
      if (day.isSelected) dayCell.addClass("selected");

      dayCell.onclick = () => this.data.onSelectDate(day.dateKey);
    }
  }
}
