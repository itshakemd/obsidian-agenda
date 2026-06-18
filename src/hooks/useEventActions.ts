import { Notice, type App } from "obsidian";
import { EventService } from "../services/EventService";
import type { AgendaStore } from "./useAgendaStore";
import type { EventItem } from "../types";

export interface EventActions {
  createEvent(title: string, eventDate: string, eventTime: string, description: string): Promise<boolean>;
  deleteEvent(event: EventItem): Promise<void>;
  reloadEvents(): Promise<void>;
}

export function useEventActions(app: App, store: AgendaStore): EventActions {
  const eventService = new EventService(app);

  async function reloadEvents(): Promise<void> {
    const events = await eventService.loadEvents();
    store.setState({ events });
  }

  async function createEvent(
    title: string,
    eventDate: string,
    eventTime: string,
    description: string
  ): Promise<boolean> {
    const cleanTitle = title.trim();
    const cleanDate = eventDate.trim();

    if (!cleanTitle) {
      new Notice("Please enter an event title.");
      return false;
    }
    if (!cleanDate) {
      new Notice("Please select a date.");
      return false;
    }

    try {
      await eventService.saveEvent(cleanTitle, cleanDate, eventTime.trim(), description.trim());
      new Notice("Event saved!");
      store.setState({ showEventComposer: false });
      await reloadEvents();
      return true;
    } catch {
      new Notice("Failed to save event.");
      return false;
    }
  }

  async function deleteEvent(event: EventItem): Promise<void> {
    await eventService.deleteEvent(event.file);
    new Notice("Event deleted");
    await reloadEvents();
  }

  return {
    createEvent,
    deleteEvent,
    reloadEvents,
  };
}
