export function insertTextAtCursor(textarea: HTMLTextAreaElement, insertion: string): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  textarea.value = val.substring(0, start) + insertion + val.substring(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
}
