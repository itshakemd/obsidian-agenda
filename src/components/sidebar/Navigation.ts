import { ICONS } from "../../constants/icons";
import type { ActiveFilter } from "../../types";

export interface NavigationData {
  activeFilter: ActiveFilter;
  allCount: number;
  unfinishedCount: number;
  upcomingEventsCount: number;
  onSelectFilter: (filter: ActiveFilter) => void;
}

export class NavigationComponent {
  private container: HTMLElement;
  private data: NavigationData;

  constructor(container: HTMLElement, data: NavigationData) {
    this.container = container;
    this.data = data;
    this.render();
  }

  update(data: NavigationData): void {
    this.data = data;
    this.render();
  }

  private render(): void {
    this.container.empty();
    const nav = this.container.createDiv({ cls: "agenda-sidebar-nav" });

    const addItem = (filter: ActiveFilter, label: string, icon: string) => {
      const isActive = this.data.activeFilter === filter;
      const el = nav.createDiv({ cls: `agenda-nav-item ${isActive ? "is-active" : ""}` });
      el.innerHTML = `${icon}<span>${label}</span>`;
      el.onclick = () => this.data.onSelectFilter(filter);
    };

    addItem("all", "All Notes", ICONS.all);
    addItem("unfinished", "Unfinished Tasks", ICONS.task);
    addItem("events", "Upcoming Events", ICONS.eventIcon);
  }
}
