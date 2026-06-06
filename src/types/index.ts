import type { TFile } from "obsidian";

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
