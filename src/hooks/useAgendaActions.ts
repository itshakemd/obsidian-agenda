import { Notice, type App } from "obsidian";
import { AgendaService } from "../services/AgendaService";
import type { AgendaStore } from "./useAgendaStore";
import type { AgendaItem } from "../types";

export interface AgendaActions {
  createAgendaItem(text: string): Promise<boolean>;
  deleteAgendaItem(item: AgendaItem): Promise<void>;
  reloadAgenda(): Promise<void>;
}

export function useAgendaActions(
  app: App,
  agendaService: AgendaService,
  store: AgendaStore
): AgendaActions {
  const reloadAgenda = async () => {
    const items = await agendaService.loadAgendaItems();
    store.setState({ agendaItems: items });
  };

  const createAgendaItem = async (text: string): Promise<boolean> => {
    if (!text.trim()) {
      new Notice("Cannot create empty agenda item");
      return false;
    }
    try {
      await agendaService.saveAgendaItem(text);
      new Notice("Agenda note created");
      await reloadAgenda();
      return true;
    } catch (e) {
      new Notice("Failed to create agenda note");
      console.error(e);
      return false;
    }
  };

  const deleteAgendaItem = async (item: AgendaItem): Promise<void> => {
    try {
      await agendaService.deleteAgendaItem(item.file);
      new Notice(`Deleted: ${item.title}`);
      await reloadAgenda();
    } catch (e) {
      new Notice("Failed to delete agenda item");
      console.error(e);
    }
  };

  return {
    createAgendaItem,
    deleteAgendaItem,
    reloadAgenda,
  };
}
