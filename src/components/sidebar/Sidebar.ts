import { ICONS, renderIcon } from "../../constants/icons";
import { CalendarComponent, type CalendarData } from "./Calendar";
import { NavigationComponent, type NavigationData } from "./Navigation";
import { FoldersListComponent, type FoldersListData } from "./FoldersList";
import { TagsListComponent, type TagsListData } from "./TagsList";
import type { ActiveFilter, FolderCount } from "../../types";

export interface SidebarData {
  calendarDate: Date;
  daysWithAgenda: Set<string>;
  daysWithEvents: Set<string>;
  allCount: number;
  unfinishedCount: number;
  upcomingEventsCount: number;
  folders: FolderCount[];
  tags: { tag: string; count: number }[];
  activeFilter: ActiveFilter;
  filterValue: string;
  isPathExcluded: (path: string) => boolean;
  onSelectBrand: () => void;
  onNewEntryClick: () => void;
  onSelectDate: (dateKey: string) => void;
  onChangeMonth: (delta: number) => void;
  onSelectFilter: (filter: ActiveFilter) => void;
  onToggleExclude: (folderPath: string, excluded: boolean) => void;
  onSelectFolder: (folderPath: string) => void;
  onSelectTag: (tag: string) => void;
}

export interface SidebarProps extends SidebarData {
  container: HTMLElement;
}

export class SidebarComponent {
  private data: SidebarData;
  private calendar: CalendarComponent;
  private navigation: NavigationComponent;
  private foldersList: FoldersListComponent;
  private tagsList: TagsListComponent;

  constructor(props: SidebarProps) {
    this.data = props;

    const sidebar = props.container.createEl("aside", { cls: "agenda-sidebar" });

    const header = sidebar.createDiv({ cls: "agenda-sidebar-header" });
    const brand = header.createDiv({ cls: "agenda-brand" });
    brand.createSpan({ cls: "agenda-brand-title", text: "Agenda" });
    brand.onclick = () => this.data.onSelectBrand();

    const newBtn = header.createEl("button", { cls: "agenda-new-btn", title: "New entry" });
    renderIcon(newBtn, ICONS.plus);
    newBtn.onclick = () => this.data.onNewEntryClick();

    this.calendar = new CalendarComponent({
      container: sidebar,
      calendarDate: this.data.calendarDate,
      daysWithAgenda: this.data.daysWithAgenda,
      daysWithEvents: this.data.daysWithEvents,
      activeFilter: this.data.activeFilter,
      filterValue: this.data.filterValue,
      onSelectDate: this.data.onSelectDate,
      onChangeMonth: this.data.onChangeMonth,
    });

    this.navigation = new NavigationComponent({
      container: sidebar,
      activeFilter: this.data.activeFilter,
      allCount: this.data.allCount,
      unfinishedCount: this.data.unfinishedCount,
      upcomingEventsCount: this.data.upcomingEventsCount,
      onSelectFilter: this.data.onSelectFilter,
    });

    this.foldersList = new FoldersListComponent({
      container: sidebar,
      folders: this.data.folders,
      activeFilter: this.data.activeFilter,
      filterValue: this.data.filterValue,
      isPathExcluded: this.data.isPathExcluded,
      onToggleExclude: this.data.onToggleExclude,
      onSelectFolder: this.data.onSelectFolder,
    });

    this.tagsList = new TagsListComponent({
      container: sidebar,
      tags: this.data.tags,
      activeFilter: this.data.activeFilter,
      filterValue: this.data.filterValue,
      onSelectTag: this.data.onSelectTag,
    });
  }

  update(data: SidebarData) {
    this.data = data;

    const calData: CalendarData = {
      calendarDate: this.data.calendarDate,
      daysWithAgenda: this.data.daysWithAgenda,
      daysWithEvents: this.data.daysWithEvents,
      activeFilter: this.data.activeFilter,
      filterValue: this.data.filterValue,
      onSelectDate: this.data.onSelectDate,
      onChangeMonth: this.data.onChangeMonth,
    };
    this.calendar.update(calData);

    const navData: NavigationData = {
      activeFilter: this.data.activeFilter,
      allCount: this.data.allCount,
      unfinishedCount: this.data.unfinishedCount,
      upcomingEventsCount: this.data.upcomingEventsCount,
      onSelectFilter: this.data.onSelectFilter,
    };
    this.navigation.update(navData);

    const foldersData: FoldersListData = {
      folders: this.data.folders,
      activeFilter: this.data.activeFilter,
      filterValue: this.data.filterValue,
      isPathExcluded: this.data.isPathExcluded,
      onToggleExclude: this.data.onToggleExclude,
      onSelectFolder: this.data.onSelectFolder,
    };
    this.foldersList.update(foldersData);

    const tagsData: TagsListData = {
      tags: this.data.tags,
      activeFilter: this.data.activeFilter,
      filterValue: this.data.filterValue,
      onSelectTag: this.data.onSelectTag,
    };
    this.tagsList.update(tagsData);
  }
}
