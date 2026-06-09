import { toDateKey } from "./date";

export interface CalendarDayItem {
  dayNumber: number;
  dateKey: string;
  isToday: boolean;
  hasAgenda: boolean;
  hasEvent: boolean;
  isSelected: boolean;
}

export interface CalendarGridData {
  monthTitle: string;
  firstDayIndex: number;
  days: CalendarDayItem[];
}

export function buildCalendarGrid(
  calendarDate: Date,
  daysWithAgenda: Set<string>,
  daysWithEvents: Set<string>,
  activeFilter: string,
  filterValue: string
): CalendarGridData {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleString("default", { month: "long" });
  const monthTitle = `${monthName} ${year}`;

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());

  const days: CalendarDayItem[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const dayDate = new Date(year, month, day);
    const dayKey = toDateKey(dayDate);

    days.push({
      dayNumber: day,
      dateKey: dayKey,
      isToday: dayKey === todayKey,
      hasAgenda: daysWithAgenda.has(dayKey),
      hasEvent: daysWithEvents.has(dayKey),
      isSelected: activeFilter === "date" && filterValue === dayKey,
    });
  }

  return {
    monthTitle,
    firstDayIndex,
    days,
  };
}
