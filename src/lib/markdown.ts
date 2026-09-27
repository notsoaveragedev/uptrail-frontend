export type MarkdownInline =
  { kind: "text" | "strong" | "code"; text: string } | { kind: "link"; text: string; href: string };

export type MarkdownBlock =
  | { kind: "heading"; inlines: MarkdownInline[] }
  | { kind: "paragraph"; inlines: MarkdownInline[] }
  | { kind: "list"; items: MarkdownInline[][] };

const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

const SAFE_HREF = /^(https?:\/\/|mailto:|\/)/i;

function parseInline(text: string): MarkdownInline[] {
  return text
    .split(INLINE_PATTERN)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) return { kind: "strong", text: part.slice(2, -2) };
      if (part.startsWith("`") && part.endsWith("`")) return { kind: "code", text: part.slice(1, -1) };
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      if (link && SAFE_HREF.test(link[2])) return { kind: "link", text: link[1], href: link[2] };
      return { kind: "text", text: link ? link[1] : part };
    });
}

export function parseMarkdown(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    const last = blocks.at(-1);
    if (!line) {
      blocks.push({ kind: "paragraph", inlines: [] });
    } else if (/^#{1,3}\s/.test(line)) {
      blocks.push({ kind: "heading", inlines: parseInline(line.replace(/^#+\s/, "")) });
    } else if (/^[-*]\s/.test(line)) {
      const item = parseInline(line.slice(2));
      if (last?.kind === "list") last.items.push(item);
      else blocks.push({ kind: "list", items: [item] });
    } else if (last?.kind === "paragraph" && last.inlines.length > 0) {
      last.inlines.push({ kind: "text", text: " " }, ...parseInline(line));
    } else {
      blocks.push({ kind: "paragraph", inlines: parseInline(line) });
    }
  }
  return blocks.filter((block) => block.kind !== "paragraph" || block.inlines.length > 0);
}
