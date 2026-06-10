export function stripMarkdown(content: string): string {
  return content
    .replace(/^#+\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, "$2 || $1")
    .trim();
}

export function renderInlineFormatting(text: string): string {
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  escaped = escaped.replace(/==(.*?)==/g, "<mark>$1</mark>");
  escaped = escaped.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");
  escaped = escaped.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
  escaped = escaped.replace(/~~(.*?)~~/g, "<del>$1</del>");
  escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
  escaped = escaped.replace(
    /(?:^|\s)#([a-zA-Z0-9_\-\/]+)/g,
    (m, tag) => ` <span class="agenda-inline-tag">#${tag}</span>`
  );

  return escaped;
}

export function isContentLong(content: string, lineLimit = 6, charLimit = 350): boolean {
  const lines = content.trim().split("\n");
  return lines.length > lineLimit || content.length > charLimit;
}
