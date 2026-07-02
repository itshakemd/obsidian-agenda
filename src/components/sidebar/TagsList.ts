import { ICONS } from "../../constants/icons";

export interface TagItemData {
  tag: string;
  count: number;
}

export interface TagsListData {
  tags: TagItemData[];
  activeFilter: string;
  filterValue: string;
  onSelectTag: (tag: string) => void;
}

export interface TagsListProps extends TagsListData {
  container: HTMLElement;
}

export class TagsListComponent {
  private container: HTMLElement;
  private data: TagsListData;
  private isCollapsed = false;
  private chevronEl: HTMLElement | null = null;
  private listEl: HTMLElement | null = null;

  constructor(props: TagsListProps) {
    this.container = props.container;
    this.data = props;
    this.render();
  }

  private render() {
    const section = this.container.createDiv({ cls: "agenda-section" });
    const header = section.createDiv({ cls: "agenda-section-header" });
    header.createSpan({ cls: "agenda-section-title", text: "TAGS" });

    this.chevronEl = header.createSpan({ cls: `agenda-section-chevron ${this.isCollapsed ? "collapsed" : ""}` });
    this.chevronEl.innerHTML = ICONS.chevronSm;

    this.listEl = section.createDiv({ cls: `agenda-tags-list ${this.isCollapsed ? "collapsed" : ""}` });

    header.onclick = () => {
      this.isCollapsed = !this.isCollapsed;
      if (this.chevronEl) this.chevronEl.toggleClass("collapsed", this.isCollapsed);
      if (this.listEl) this.listEl.toggleClass("collapsed", this.isCollapsed);
    };

    this.update(this.data);
  }

  update(data: TagsListData) {
    this.data = data;
    if (!this.listEl) return;
    this.listEl.toggleClass("collapsed", this.isCollapsed);
    this.listEl.empty();

    if (this.data.tags.length === 0) {
      const emptyMsg = this.listEl.createDiv();
      emptyMsg.style.fontSize = "12px";
      emptyMsg.style.color = "var(--text-faint)";
      emptyMsg.style.padding = "4px 8px";
      emptyMsg.textContent = "No tags yet";
      return;
    }

    for (const { tag, count } of this.data.tags) {
      const isSelected = this.data.activeFilter === "tag" && this.data.filterValue === tag;
      const item = this.listEl.createDiv({
        cls: `agenda-tag-item ${isSelected ? "active" : ""}`,
      });

      const left = item.createDiv({ cls: "agenda-tag-left" });
      left.innerHTML = `<span class="agenda-tag-hash">#</span><span>${tag}</span>`;

      item.createSpan({ cls: "agenda-badge", text: String(count) });

      item.onclick = () => {
        this.data.onSelectTag(tag);
      };
    }
  }
}
