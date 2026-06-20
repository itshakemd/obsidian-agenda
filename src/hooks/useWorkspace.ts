import { Notice, type App } from "obsidian";

export interface WorkspaceHooks {
  openNote(path: string, inTab?: boolean): void;
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

  return {
    openNote,
  };
}
