import { ICONS } from "../../constants/icons";
import type { ActiveFilter } from "../../types";

export interface NavigationData {
  activeFilter: ActiveFilter;
  allCount: number;
  unfinishedCount: number;
  upcomingEventsCount: number;
  onSelectFilter: (filter: ActiveFilter) => void;
}

export interface NavigationProps extends NavigationData {
  container: HTMLElement;
}

export class NavigationComponent {
  private container: HTMLElement;
  private data: NavigationData;
  private unfinishedMenuEl: HTMLElement | null = null;
  private allMenuEl: HTMLElement | null = null;
  private eventsMenuEl: HTMLElement | null = null;
  private unfinishedBadgeEl: HTMLElement | null = null;
  private allBadgeEl: HTMLElement | null = null;
  private eventsBadgeEl: HTMLElement | null = null;

  constructor(props: NavigationProps) {
    this.container = props.container;
    this.data = props;
    this.render();
  }

  private render() {
    const viewsSection = this.container.createDiv({ cls: "agenda-section" });
    viewsSection.createDiv({ cls: "agenda-section-title", text: "VIEWS" });

    this.unfinishedMenuEl = viewsSection.createDiv({
      cls: `agenda-menu-item ${this.data.activeFilter === "unfinished" ? "active" : ""}`,
    });
    const unfinLeft = this.unfinishedMenuEl.createDiv({ cls: "agenda-menu-left" });
    unfinLeft.innerHTML = `${ICONS.task}<span>Unfinished</span>`;
    this.unfinishedBadgeEl = this.unfinishedMenuEl.createSpan({ cls: "agenda-badge unfinished-count", text: "0" });
    this.unfinishedMenuEl.onclick = () => this.data.onSelectFilter("unfinished");

    this.allMenuEl = viewsSection.createDiv({
      cls: `agenda-menu-item ${this.data.activeFilter === "all" ? "active" : ""}`,
    });
    const allLeft = this.allMenuEl.createDiv({ cls: "agenda-menu-left" });
    allLeft.innerHTML = `${ICONS.all}<span>All</span>`;
    this.allBadgeEl = this.allMenuEl.createSpan({ cls: "agenda-badge all-count", text: "0" });
    this.allMenuEl.onclick = () => this.data.onSelectFilter("all");

    this.eventsMenuEl = viewsSection.createDiv({
      cls: `agenda-menu-item ${this.data.activeFilter === "events" ? "active" : ""}`,
    });
    const eventsLeft = this.eventsMenuEl.createDiv({ cls: "agenda-menu-left" });
    eventsLeft.innerHTML = `${ICONS.eventIcon}<span>Events</span>`;
    this.eventsBadgeEl = this.eventsMenuEl.createSpan({ cls: "agenda-badge events-count", text: "0" });
    this.eventsMenuEl.onclick = () => this.data.onSelectFilter("events");

    this.update(this.data);
  }

  update(data: NavigationData) {
    this.data = data;

    if (this.allBadgeEl) {
      this.allBadgeEl.textContent = String(this.data.allCount);
    }
    if (this.unfinishedBadgeEl) {
      this.unfinishedBadgeEl.textContent = String(this.data.unfinishedCount);
    }
    if (this.eventsBadgeEl) {
      this.eventsBadgeEl.textContent = String(this.data.upcomingEventsCount);
    }

    if (this.allMenuEl) {
      this.allMenuEl.toggleClass("active", this.data.activeFilter === "all");
    }
    if (this.unfinishedMenuEl) {
      this.unfinishedMenuEl.toggleClass("active", this.data.activeFilter === "unfinished");
    }
    if (this.eventsMenuEl) {
      this.eventsMenuEl.toggleClass("active", this.data.activeFilter === "events");
    }
  }
}
