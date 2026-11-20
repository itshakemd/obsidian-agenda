import { ICONS, renderIcon } from "../../constants/icons";
import type { ViewMode } from "../../types";

export interface FilterBarData {
  title: string;
  isFiltered: boolean;
  viewMode: ViewMode;
  onClearFilter: () => void;
  onChangeViewMode: (mode: ViewMode) => void;
}

export interface FilterBarProps extends FilterBarData {
  container: HTMLElement;
}

export class FilterBarComponent {
  private container: HTMLElement;
  private data: FilterBarData;
  private filterTitleEl: HTMLElement | null = null;
  private clearBtn: HTMLElement | null = null;
  private feedBtn: HTMLElement | null = null;
  private tileBtn: HTMLElement | null = null;

  constructor(props: FilterBarProps) {
    this.container = props.container;
    this.data = props;
    this.render();
  }

  private render() {
    this.container.empty();

    const left = this.container.createDiv({ cls: "agenda-filter-info" });
    this.filterTitleEl = left.createSpan({ cls: "agenda-filter-text", text: this.data.title });

    this.clearBtn = left.createEl("button", { cls: "agenda-filter-clear", text: "Show All" });
    this.clearBtn.onclick = () => this.data.onClearFilter();
    this.clearBtn.toggleClass("is-hidden", !this.data.isFiltered);

    const switcher = this.container.createDiv({ cls: "agenda-view-switcher" });

    this.feedBtn = switcher.createEl("button", {
      cls: `agenda-view-btn${this.data.viewMode === "feed" ? " active" : ""}`,
      title: "Feed view",
    });
    renderIcon(this.feedBtn.createSpan(), ICONS.feedList);
    this.feedBtn.onclick = () => this.data.onChangeViewMode("feed");

    this.tileBtn = switcher.createEl("button", {
      cls: `agenda-view-btn${this.data.viewMode === "tile" ? " active" : ""}`,
      title: "Tile view",
    });
    renderIcon(this.tileBtn.createSpan(), ICONS.grid);
    this.tileBtn.onclick = () => this.data.onChangeViewMode("tile");
  }

  update(data: FilterBarData) {
    this.data = data;
    if (this.filterTitleEl) {
      this.filterTitleEl.textContent = this.data.title;
    }
    if (this.clearBtn) {
      this.clearBtn.toggleClass("is-hidden", !this.data.isFiltered);
    }
    if (this.feedBtn) {
      this.feedBtn.toggleClass("active", this.data.viewMode === "feed");
    }
    if (this.tileBtn) {
      this.tileBtn.toggleClass("active", this.data.viewMode === "tile");
    }
  }
}
