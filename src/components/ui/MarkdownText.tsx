import { useMemo } from "react";
import { parseMarkdown, type MarkdownInline } from "@/lib/markdown";

export function MarkdownText({ source, className = "" }: { source: string; className?: string }) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);

  return (
    <div className={`flex flex-col gap-2 text-sm ${className}`}>
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h3 key={index} className="text-sm font-semibold text-ink">
              <Inlines inlines={block.inlines} />
            </h3>
          );
        }
        if (block.kind === "list") {
          return (
            <ul key={index} className="flex list-disc flex-col gap-1 pl-4 marker:text-faint">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inlines inlines={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            <Inlines inlines={block.inlines} />
          </p>
        );
      })}
    </div>
  );
}

function Inlines({ inlines }: { inlines: MarkdownInline[] }) {
  return inlines.map((inline, index) => {
    if (inline.kind === "strong") {
      return (
        <strong key={index} className="font-semibold text-ink">
          {inline.text}
        </strong>
      );
    }
    if (inline.kind === "code") {
      return (
        <code key={index} className="rounded-sm bg-hover px-1 py-0.5 font-mono text-xs text-ink">
          {inline.text}
        </code>
      );
    }
    if (inline.kind === "link") {
      return (
        <a key={index} href={inline.href} target="_blank" rel="noreferrer">
          {inline.text}
        </a>
      );
    }
    return inline.text;
  });
}
