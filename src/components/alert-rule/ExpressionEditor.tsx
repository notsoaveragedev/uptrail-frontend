import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { LuCircleCheck } from "react-icons/lu";
import { suggestions, type Suggestion } from "@/lib/alertExpression/catalog";
import { highlightSegments, TOKEN_CLASS } from "@/lib/alertExpression/highlight";
import type { ParseError } from "@/lib/alertExpression/parse";

type ExpressionEditorProps = {
  id: string;
  value: string;
  error: ParseError | null;
  labelId: string;
  onChange: (value: string) => void;
};

const TEXT_LAYER = "m-0 min-h-24 w-full px-3 py-2.5 font-mono text-xs leading-6 break-words whitespace-pre-wrap";

const KIND_LABEL: Record<Suggestion["kind"], string> = {
  fn: "fn",
  field: "field",
  kw: "kw",
  op: "op",
  value: "val",
};

export function ExpressionEditor({ id, value, error, labelId, onChange }: ExpressionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaretRef = useRef<number | null>(null);
  const [caret, setCaret] = useState(value.length);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listboxId = useId();
  const messageId = useId();

  const result = isOpen ? suggestions(value, caret) : null;
  const items = result?.items ?? [];
  const isExpanded = items.length > 0;
  const active = Math.min(activeIndex, items.length - 1);
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const activeId = isExpanded ? optionId(active) : undefined;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || pendingCaretRef.current === null) return;
    textarea.setSelectionRange(pendingCaretRef.current, pendingCaretRef.current);
    pendingCaretRef.current = null;
  }, [value]);

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  function open() {
    setIsOpen(true);
    setActiveIndex(0);
  }

  function handleChange(next: string, nextCaret: number) {
    if (next.length > value.length) open();
    setCaret(nextCaret);
    onChange(next);
  }

  function accept(item: Suggestion) {
    if (!result) return;
    const insert = value[result.to] === " " ? item.insert.trimEnd() : item.insert;
    const nextCaret = result.from + insert.length;
    pendingCaretRef.current = nextCaret;
    setCaret(nextCaret);
    setActiveIndex(0);
    onChange(value.slice(0, result.from) + insert + value.slice(result.to));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === " " && event.ctrlKey) {
      event.preventDefault();
      open();
      return;
    }
    if (!isExpanded) return;
    const moves: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };
    if (event.key in moves) {
      event.preventDefault();
      setActiveIndex((active + moves[event.key] + items.length) % items.length);
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      accept(items[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`relative rounded-md border bg-panel transition-colors ${
          error ? "border-down" : "border-line focus-within:border-line-strong hover:border-line-strong"
        }`}
      >
        <pre aria-hidden className={`${TEXT_LAYER} text-ink`}>
          {highlightSegments(value, error).map((segment, index) => (
            <span
              key={index}
              className={`${segment.type ? TOKEN_CLASS[segment.type] : ""} ${
                segment.isError ? "underline decoration-down decoration-wavy underline-offset-4" : ""
              }`}
            >
              {segment.text}
            </span>
          ))}
          {"\n"}
        </pre>

        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          role="combobox"
          aria-labelledby={labelId}
          aria-expanded={isExpanded}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          onChange={(event) => handleChange(event.target.value, event.target.selectionStart)}
          onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsOpen(false)}
          className={`${TEXT_LAYER} absolute inset-0 resize-none overflow-hidden bg-transparent text-transparent caret-ink outline-none selection:bg-accent-soft`}
        />

        <div className={`${TEXT_LAYER} pointer-events-none invisible absolute inset-0`}>
          {value.slice(0, caret)}
          <span className="relative">
            {isExpanded && (
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Suggestions"
                className="pointer-events-auto visible absolute top-full left-0 z-20 mt-1.5 flex max-h-60 w-80 flex-col overflow-y-auto rounded-lg border border-line-strong bg-card p-1 font-sans whitespace-normal shadow-overlay"
              >
                {items.map((item, index) => (
                  <li
                    key={`${item.kind}-${item.label}`}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === active}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      accept(item);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 ${
                      index === active ? "bg-hover" : ""
                    }`}
                  >
                    <span className="w-11 shrink-0 rounded-sm border border-line px-1 text-center font-mono text-caps whitespace-nowrap text-subtle uppercase">
                      {KIND_LABEL[item.kind]}
                    </span>
                    <span className="font-mono text-xs text-ink">{item.label}</span>
                    <span className="ml-auto truncate text-xs text-subtle">{item.hint}</span>
                  </li>
                ))}
              </ul>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 text-xs">
        <p id={messageId} aria-live="polite" className={error ? "text-down" : "text-muted"}>
          {error ? (
            <>
              <span className="font-mono">
                {error.line}:{error.column}
              </span>{" "}
              {error.message}
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <LuCircleCheck aria-hidden className="size-3.5 text-up" />
              Valid expression
            </span>
          )}
        </p>
        <span className="flex shrink-0 items-center gap-1 text-subtle">
          <kbd className="kbd">⌃</kbd>
          <kbd className="kbd">Space</kbd>
          suggestions
        </span>
      </div>
    </div>
  );
}
