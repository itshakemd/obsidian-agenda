import { Notice } from "obsidian";
import { toDateKey } from "../../utils/date";

export interface EventComposerProps {
  container: HTMLElement;
  onSubmit: (title: string, eventDate: string, eventTime: string, description: string) => Promise<boolean>;
  onCancel: () => void;
}

export class EventComposerComponent {
  private props: EventComposerProps;

  constructor(props: EventComposerProps) {
    this.props = props;
    this.render();
  }

  private render(): void {
    const { container, onSubmit, onCancel } = this.props;
    container.empty();

    const box = container.createDiv({ cls: "agenda-event-composer-box" });
    box.createEl("h4", { text: "New Event" });

    const titleInput = box.createEl("input", {
      cls: "agenda-event-input",
      attr: { placeholder: "Event Title" },
    });

    const row = box.createDiv({ cls: "agenda-event-row" });
    const dateInput = row.createEl("input", {
      type: "date",
      cls: "agenda-event-date-picker",
      value: toDateKey(new Date()),
    });
    const timeInput = row.createEl("input", {
      type: "time",
      cls: "agenda-event-time-picker",
    });

    const descInput = box.createEl("textarea", {
      cls: "agenda-event-desc",
      attr: { placeholder: "Event description..." },
    });

    const actions = box.createDiv({ cls: "agenda-event-actions" });
    const cancelBtn = actions.createEl("button", { cls: "agenda-composer-btn", text: "Cancel" });
    cancelBtn.onclick = () => onCancel();

    const saveBtn = actions.createEl("button", { cls: "agenda-composer-submit-btn", text: "Save Event" });
    saveBtn.onclick = async () => {
      const title = titleInput.value.trim();
      const dateVal = dateInput.value;
      if (!title) {
        new Notice("Event title is required");
        titleInput.focus();
        return;
      }
      if (!dateVal) {
        new Notice("Event date is required");
        dateInput.focus();
        return;
      }
      saveBtn.disabled = true;
      try {
        await onSubmit(title, dateVal, timeInput.value, descInput.value);
      } finally {
        saveBtn.disabled = false;
      }
    };
  }
}
