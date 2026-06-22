import { insertTextAtCursor } from "../utils/editor";

export interface ComposerLogic {
  insertTag(): void;
  insertTodo(): void;
  insertLink(): void;
  insertCode(): void;
  handleKeyDown(e: KeyboardEvent, onSubmit: () => void): void;
}

export function createComposerLogic(getTextarea: () => HTMLTextAreaElement | null): ComposerLogic {
  function insertTag(): void {
    const textarea = getTextarea();
    if (textarea) insertTextAtCursor(textarea, "#");
  }

  function insertTodo(): void {
    const textarea = getTextarea();
    if (textarea) insertTextAtCursor(textarea, "- [ ] ");
  }

  function insertLink(): void {
    const textarea = getTextarea();
    if (textarea) insertTextAtCursor(textarea, "[Title](https://...)");
  }

  function insertCode(): void {
    const textarea = getTextarea();
    if (textarea) insertTextAtCursor(textarea, "`code`");
  }

  function handleKeyDown(e: KeyboardEvent, onSubmit: () => void): void {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  }

  return {
    insertTag,
    insertTodo,
    insertLink,
    insertCode,
    handleKeyDown,
  };
}
