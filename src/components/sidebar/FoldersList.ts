import { ICONS } from "../../constants/icons";
import type { FolderCount } from "../../types";

export interface FoldersListData {
  folders: FolderCount[];
  activeFilter: string;
  filterValue: string;
  isPathExcluded: (path: string) => boolean;
  onToggleExclude: (folderPath: string, excluded: boolean) => void;
  onSelectFolder: (folderPath: string) => void;
}

export interface FoldersListProps extends FoldersListData {
  container: HTMLElement;
}

export class FoldersListComponent {
  private container: HTMLElement;
  private data: FoldersListData;
  private isCollapsed = false;
  private chevronEl: HTMLElement | null = null;
  private listEl: HTMLElement | null = null;

  constructor(props: FoldersListProps) {
    this.container = props.container;
    this.data = props;
    this.render();
  }

  private render() {
    const section = this.container.createDiv({ cls: "agenda-section" });
    const header = section.createDiv({ cls: "agenda-section-header" });
    header.createSpan({ cls: "agenda-section-title", text: "FOLDERS" });

    this.chevronEl = header.createSpan({ cls: `agenda-section-chevron ${this.isCollapsed ? "collapsed" : ""}` });
    this.chevronEl.innerHTML = ICONS.chevronSm;

    this.listEl = section.createDiv({ cls: `agenda-folders-list ${this.isCollapsed ? "collapsed" : ""}` });

    header.onclick = () => {
      this.isCollapsed = !this.isCollapsed;
      if (this.chevronEl) this.chevronEl.toggleClass("collapsed", this.isCollapsed);
      if (this.listEl) this.listEl.toggleClass("collapsed", this.isCollapsed);
    };

    this.update(this.data);
  }

  update(data: FoldersListData) {
    this.data = data;
    if (!this.listEl) return;
    this.listEl.toggleClass("collapsed", this.isCollapsed);
    this.listEl.empty();

    if (this.data.folders.length === 0) {
      const emptyMsg = this.listEl.createDiv();
      emptyMsg.style.fontSize = "12px";
      emptyMsg.style.color = "var(--text-faint)";
      emptyMsg.style.padding = "4px 8px";
      emptyMsg.textContent = "No folders";
      return;
    }

    for (const folder of this.data.folders) {
      const isSelected = this.data.activeFilter === "folder" && this.data.filterValue === folder.path;
      const isIncluded = !this.data.isPathExcluded(folder.path);

      const item = this.listEl.createDiv({
        cls: `agenda-folder-item ${isSelected ? "active" : ""}`,
      });

      const left = item.createDiv({ cls: "agenda-folder-left" });

      const checkbox = left.createEl("input", {
        cls: "agenda-folder-checkbox",
        type: "checkbox",
      });
      checkbox.checked = isIncluded;
      checkbox.title = isIncluded ? "Uncheck to hide folder from feed" : "Check to show folder in feed";
      checkbox.onclick = (e) => {
        e.stopPropagation();
        this.data.onToggleExclude(folder.path, !checkbox.checked);
        checkbox.title = checkbox.checked ? "Uncheck to hide folder from feed" : "Check to show folder in feed";
      };

      const folderNameSpan = left.createSpan({ cls: "agenda-folder-name" });
      folderNameSpan.innerHTML = `${ICONS.folder}<span>${folder.name}</span>`;

      item.createSpan({ cls: "agenda-badge", text: String(folder.count) });

      item.onclick = () => {
        this.data.onSelectFolder(folder.path);
      };
    }
  }
}
