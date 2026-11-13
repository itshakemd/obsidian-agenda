import { Notice, type App } from "obsidian";
import { formatEventDateTime } from "../utils/date";
import type { EventItem } from "../types";

export interface WorkspaceHooks {
  openNote(path: string, inTab?: boolean): void;
  copyText(text: string, noticeMsg?: string): Promise<void>;
  copyEvent(event: EventItem): Promise<void>;
}

export function useWorkspace(app: App): WorkspaceHooks {
  function openNote(path: string, inTab = true): void {
    app.workspace.openLinkText(path, "", inTab ? "tab" : false);
  }

  async function copyText(text: string, noticeMsg = "Copied to clipboard"): Promise<void> {
    await navigator.clipboard.writeText(text);
    new Notice(noticeMsg);
  }

  async function copyEvent(event: EventItem): Promise<void> {
    const dateStr = formatEventDateTime(event.eventDate, event.eventTime);
    const text = `${event.title}\n${dateStr}\n\n${event.description}`;
    await copyText(text);
  }

  return {
    openNote,
    copyText,
    copyEvent,
  };
}
