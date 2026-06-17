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
  isLoading: boolean;
}

export type StateListener = () => void;

export class AgendaStore {
  private state: AgendaState;
  private listeners: Set<StateListener> = new Set();

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
      isLoading: false,
      ...initialState,
    };
  }

  getState(): AgendaState {
    return this.state;
  }

  setState(partial: Partial<AgendaState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
