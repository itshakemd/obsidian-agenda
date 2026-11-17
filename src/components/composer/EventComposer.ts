import { toDateKey } from "../../utils/date";

export interface EventComposerProps {
  container: HTMLElement;
  onSubmit: (title: string, eventDate: string, eventTime: string, description: string) => Promise<boolean>;
  onCancel: () => void;
}

export class EventComposerComponent {
  private props: EventComposerProps;
  private titleInput: HTMLInputElement | null = null;
  private dateInput: HTMLInputElement | null = null;
  private timeInput: HTMLInputElement | null = null;
  private descInput: HTMLTextAreaElement | null = null;
  private saveBtn: HTMLButtonElement | null = null;

  constructor(props: EventComposerProps) {
    this.props = props;
    this.render();
  }

  private render() {
    this.props.container.empty();
    const composer = this.props.container.createDiv({ cls: "agenda-composer agenda-event-composer" });

    const header = composer.createDiv({ cls: "agenda-event-composer-header" });
    header.createSpan({ cls: "agenda-event-composer-title", text: "New Event" });

    const fields = composer.createDiv({ cls: "agenda-event-fields" });

    const titleRow = fields.createDiv({ cls: "agenda-event-field-row" });
    titleRow.createEl("label", { cls: "agenda-event-label", text: "Title" });
    this.titleInput = titleRow.createEl("input", {
      cls: "agenda-event-input",
      type: "text",
      placeholder: "Event title...",
    });

    const dateRow = fields.createDiv({ cls: "agenda-event-field-row" });
    dateRow.createEl("label", { cls: "agenda-event-label", text: "Date" });
    this.dateInput = dateRow.createEl("input", { cls: "agenda-event-input", type: "date" });
    this.dateInput.value = toDateKey(new Date());

    const timeRow = fields.createDiv({ cls: "agenda-event-field-row" });
    timeRow.createEl("label", { cls: "agenda-event-label", text: "Time" });
    this.timeInput = timeRow.createEl("input", { cls: "agenda-event-input agenda-event-time-input", type: "time" });

    const descRow = fields.createDiv({ cls: "agenda-event-field-row agenda-event-desc-row" });
    descRow.createEl("label", { cls: "agenda-event-label", text: "Notes" });
    this.descInput = descRow.createEl("textarea", {
      cls: "agenda-textarea agenda-event-desc-textarea",
      placeholder: "Optional description...",
    });

    const toolbar = composer.createDiv({ cls: "agenda-composer-toolbar" });
    const leftSide = toolbar.createDiv();
    const cancelBtn = leftSide.createEl("button", { cls: "agenda-filter-clear", text: "Cancel" });
    cancelBtn.onclick = () => this.props.onCancel();

    const actions = toolbar.createDiv({ cls: "agenda-toolbar-actions" });
    this.saveBtn = actions.createEl("button", { cls: "agenda-btn-save", text: "Save Event" });
    this.saveBtn.onclick = () => this.handleSubmit();
  }

  private async handleSubmit() {
    if (!this.titleInput || !this.dateInput || !this.timeInput || !this.descInput || !this.saveBtn) return;

    this.saveBtn.disabled = true;
    this.saveBtn.textContent = "Saving...";

    const success = await this.props.onSubmit(
      this.titleInput.value,
      this.dateInput.value,
      this.timeInput.value,
      this.descInput.value
    );

    this.saveBtn.disabled = false;
    this.saveBtn.textContent = "Save Event";

    if (success) {
      this.resetForm();
    }
  }

  private resetForm() {
    if (!this.titleInput || !this.dateInput || !this.timeInput || !this.descInput) return;
    this.titleInput.value = "";
    this.timeInput.value = "";
    this.descInput.value = "";
    this.dateInput.value = toDateKey(new Date());
  }
}
