import { ICONS } from "../../constants/icons";
import { createComposerLogic, type ComposerLogic } from "../../hooks/useComposer";

export interface AgendaComposerProps {
  container: HTMLElement;
  onSubmit: (text: string) => Promise<boolean>;
  onToggleEventComposer: () => void;
}

export class AgendaComposerComponent {
  private props: AgendaComposerProps;
  private textarea: HTMLTextAreaElement | null = null;
  private logic: ComposerLogic | null = null;

  constructor(props: AgendaComposerProps) {
    this.props = props;
    this.render();
  }

  private render(): void {
    const { container, onSubmit, onToggleEventComposer } = this.props;
    container.empty();

    const composerBox = container.createDiv({ cls: "agenda-composer-box" });
    const ta = composerBox.createEl("textarea", {
      cls: "agenda-composer-textarea",
      attr: { placeholder: "Write note, add #tags, todos (- [ ])..." },
    });
    this.textarea = ta;
    this.logic = createComposerLogic(ta);

    const toolbar = composerBox.createDiv({ cls: "agenda-composer-toolbar" });
    const tools = toolbar.createDiv({ cls: "agenda-composer-tools" });

    const btnTag = tools.createEl("button", { cls: "agenda-composer-btn", text: "#" });
    btnTag.onclick = () => this.logic?.insertTag();

    const btnTodo = tools.createEl("button", { cls: "agenda-composer-btn" });
    btnTodo.innerHTML = ICONS.task;
    btnTodo.onclick = () => this.logic?.insertTodo();

    const actions = toolbar.createDiv({ cls: "agenda-composer-actions" });
    const eventBtn = actions.createEl("button", { cls: "agenda-composer-btn" });
    eventBtn.innerHTML = ICONS.calendarPlus;
    eventBtn.onclick = () => onToggleEventComposer();

    const submitBtn = actions.createEl("button", { cls: "agenda-composer-submit-btn", text: "Save Note" });
    submitBtn.onclick = async () => {
      const text = ta.value.trim();
      const ok = await onSubmit(text);
      if (ok) ta.value = "";
    };
  }
}
