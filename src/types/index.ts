import type { TFile } from "obsidian";

export type ActiveFilter = "all" | "unfinished" | "date" | "tag" | "folder" | "events";

export type ViewMode = "feed" | "tile";

export interface AgendaItem {
  id: string;
  path: string;
  folderPath: string;
  title: string;
  date: Date;
  dateKey: string;
  content: string;
  tags: string[];
  file: TFile;
  hasUnfinishedTasks: boolean;
  links: Array<{ title: string; url: string }>;
}

export interface EventItem {
  id: string;
  path: string;
  title: string;
  date: Date;
  dateKey: string;
  eventDate: Date;
  eventDateKey: string;
  eventTime: string | null;
  description: string;
  file: TFile;
  tags: string[];
}

export type FeedEntry =
  | { type: "agenda"; item: AgendaItem; sortDate: Date }
  | { type: "event"; item: EventItem; sortDate: Date };

export interface ExtractedImage {
  src: string;
  alt: string;
  file?: TFile;
}

export interface FolderCount {
  path: string;
  name: string;
  count: number;
}
