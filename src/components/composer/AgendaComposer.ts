import { ICONS, renderIcon } from "../../constants/icons";
import { createComposerLogic, type ComposerLogic } from "../../hooks/useComposer";

export interface AgendaComposerProps {
  container: HTMLElement;
  onSubmit: (text: string) => Promise<boolean>;
  onToggleEventComposer: () => void;
}

export class AgendaComposerComponent {
  private props: AgendaComposerProps;
  private textarea: HTMLTextAreaElement | null = null;
  private saveBtn: HTMLButtonElement | null = null;
  private composerLogic: ComposerLogic;

  constructor(props: AgendaComposerProps) {
    this.props = props;
    this.composerLogic = createComposerLogic(() => this.textarea);
    this.render();
  }

  private render() {
    const composer = this.props.container.createDiv({ cls: "agenda-composer" });

    this.textarea = composer.createEl("textarea", {
      cls: "agenda-textarea",
      placeholder: "What's on your agenda?...",
    });

    this.textarea.addEventListener("keydown", (e) => {
      this.composerLogic.handleKeyDown(e, () => {
        void this.handleSubmit();
      });
    });

    const toolbar = composer.createDiv({ cls: "agenda-composer-toolbar" });
    const tools = toolbar.createDiv({ cls: "agenda-toolbar-tools" });

    const tagTool = tools.createEl("button", { cls: "agenda-tool-btn", title: "Add tag" });
    tagTool.textContent = "#";
    tagTool.onclick = () => this.composerLogic.insertTag();

    const todoTool = tools.createEl("button", { cls: "agenda-tool-btn", title: "Add todo task" });
    renderIcon(todoTool, ICONS.checkSquare);
    todoTool.onclick = () => this.composerLogic.insertTodo();

    const linkTool = tools.createEl("button", { cls: "agenda-tool-btn", title: "Add link" });
    renderIcon(linkTool, ICONS.link);
    linkTool.onclick = () => this.composerLogic.insertLink();

    const codeTool = tools.createEl("button", { cls: "agenda-tool-btn", title: "Add code" });
    renderIcon(codeTool, ICONS.code);
    codeTool.onclick = () => this.composerLogic.insertCode();

    const eventToggle = tools.createEl("button", {
      cls: "agenda-tool-btn agenda-event-toggle-btn",
      title: "Add Event",
    });
    renderIcon(eventToggle, ICONS.calendarPlus);
    eventToggle.onclick = () => this.props.onToggleEventComposer();

    const actions = toolbar.createDiv({ cls: "agenda-toolbar-actions" });

    this.saveBtn = actions.createEl("button", { cls: "agenda-btn-save", text: "Save" });
    this.saveBtn.onclick = () => {
      void this.handleSubmit();
    };
  }

  private async handleSubmit() {
    if (!this.textarea || !this.saveBtn) return;

    this.saveBtn.disabled = true;
    this.saveBtn.textContent = "Saving...";

    const success = await this.props.onSubmit(this.textarea.value);

    this.saveBtn.disabled = false;
    this.saveBtn.textContent = "Save";

    if (success && this.textarea) {
      this.textarea.value = "";
    }
  }

  focus() {
    this.textarea?.focus();
    this.textarea?.scrollIntoView({ behavior: "smooth" });
  }
}
