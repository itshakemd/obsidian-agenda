import { Notice, type App } from "obsidian";
import { formatEventDateTime } from "../utils/date";
import type { EventItem } from "../types";

export interface WorkspaceHooks {
  openNote(path: string, inTab?: boolean): void;
  copyText(text: string, noticeMsg?: string): Promise<void>;
  copyEvent(event: EventItem): Promise<void>;
}

export function useWorkspace(app: App): WorkspaceHooks {
  const openNote = (path: string, inTab = false) => {
    const file = app.vault.getAbstractFileByPath(path);
    if (!file) {
      new Notice("Note not found");
      return;
    }
    const leaf = inTab ? app.workspace.getLeaf("tab") : app.workspace.getLeaf();
    leaf.openFile(file as any);
  };

  const copyText = async (text: string, noticeMsg = "Copied to clipboard") => {
    await navigator.clipboard.writeText(text);
    new Notice(noticeMsg);
  };

  const copyEvent = async (event: EventItem) => {
    const timeFormatted = formatEventDateTime(event.eventDate, event.eventTime);
    let text = `Event: ${event.title}\nDate: ${timeFormatted}`;
    if (event.description) {
      text += `\n\n${event.description}`;
    }
    await copyText(text, "Event copied to clipboard");
  };

  return {
    openNote,
    copyText,
    copyEvent,
  };
}
