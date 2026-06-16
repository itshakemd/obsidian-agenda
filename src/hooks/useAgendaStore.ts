import type { AgendaItem, EventItem, ActiveFilter, ViewMode, FolderCount } from "../types";

export interface AgendaState {
  agendaItems: AgendaItem[];
  events: EventItem[];
  activeFilter: ActiveFilter;
  filterValue: string;
  calendarDate: Date;
  showEventComposer: boolean;
  viewMode: ViewMode;
  folders: FolderCount[];
}

export type StateListener = (state: AgendaState) => void;

export class AgendaStore {
  private state: AgendaState;

  constructor(initialState?: Partial<AgendaState>) {
    this.state = {
      agendaItems: [],
      events: [],
      activeFilter: "all",
      filterValue: "",
      calendarDate: new Date(),
      showEventComposer: false,
      viewMode: "feed",
      folders: [],
      ...initialState,
    };
  }

  getState(): AgendaState {
    return this.state;
  }

  setState(partial: Partial<AgendaState>): void {
    this.state = { ...this.state, ...partial };
  }
}
