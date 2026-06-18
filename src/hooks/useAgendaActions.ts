import { Notice, type App } from "obsidian";
import { AgendaService } from "../services/AgendaService";
import type { AgendaStore } from "./useAgendaStore";
import type { AgendaItem } from "../types";

export interface AgendaActions {
  createAgendaItem(text: string): Promise<boolean>;
  deleteAgendaItem(item: AgendaItem): Promise<void>;
  toggleTask(item: AgendaItem, lineIndex: number, isChecked: boolean): Promise<void>;
  reloadAgenda(): Promise<void>;
}

export function useAgendaActions(app: App, store: AgendaStore): AgendaActions {
  const agendaService = new AgendaService(app);

  async function reloadAgenda(): Promise<void> {
    const agendaItems = await agendaService.loadAgendaItems();
    const folders = agendaService.getVaultFolders();
    store.setState({ agendaItems, folders });
  }

  async function createAgendaItem(text: string): Promise<boolean> {
    const trimmed = text.trim();
    if (!trimmed) {
      new Notice("Please enter some text.");
      return false;
    }

    try {
      const state = store.getState();
      let targetFolder = "Agenda";
      if (state.activeFilter === "folder" && state.filterValue) {
        targetFolder = state.filterValue;
      }

      await agendaService.saveAgendaItem(trimmed, targetFolder);
      new Notice("Saved!");
      await reloadAgenda();
      return true;
    } catch {
      new Notice("Failed to save.");
      return false;
    }
  }

  async function deleteAgendaItem(item: AgendaItem): Promise<void> {
    await agendaService.deleteAgendaItem(item.file);
    new Notice("Note deleted");
    await reloadAgenda();
  }

  async function toggleTask(item: AgendaItem, lineIndex: number, isChecked: boolean): Promise<void> {
    const res = await agendaService.toggleTask(item.file, item.content, lineIndex, isChecked);
    item.content = res.updatedContent;
    item.hasUnfinishedTasks = res.hasUnfinishedTasks;
    store.notify();
  }

  return {
    createAgendaItem,
    deleteAgendaItem,
    toggleTask,
    reloadAgenda,
  };
}
