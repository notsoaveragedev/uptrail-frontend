import { Checkbox } from "antd";
import { useState } from "react";
import { CustomInput } from "@/components/ui/CustomInput";
import { toggleItem } from "@/lib/list";
import type { FacetOption } from "@/types/facet";

type FacetSectionProps = {
  title: string;
  options: FacetOption[];
  counts: Record<string, number>;
  selected: string[];
  isStale: boolean;
  onChange: (selected: string[]) => void;
  collapsedLimit?: number;
};

export function FacetSection({
  title,
  options,
  counts,
  selected,
  isStale,
  onChange,
  collapsedLimit,
}: FacetSectionProps) {
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const max = Math.max(1, ...options.map((option) => counts[option.value] ?? 0));
  const matching = options.filter((option) =>
    (option.searchText ?? option.value).toLowerCase().includes(search.trim().toLowerCase()),
  );
  const visible = collapsedLimit && !isExpanded && !search ? matching.slice(0, collapsedLimit) : matching;

  return (
    <section className="flex flex-col gap-1 border-b border-line px-3 py-3">
      <div className="flex items-center justify-between px-1 pb-1">
        <h3 className="text-caps font-semibold tracking-widest text-subtle uppercase">{title}</h3>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="cursor-pointer text-xs text-muted hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      {collapsedLimit && options.length > 10 && (
        <div className="px-1 pb-1">
          <CustomInput
            type="search"
            size="small"
            aria-label={`Search ${title.toLowerCase()}`}
            placeholder={`Filter ${title.toLowerCase()}`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}

      <ul className={isStale ? "opacity-50 transition-opacity" : "transition-opacity"}>
        {visible.map((option) => {
          const count = counts[option.value] ?? 0;
          return (
            <li key={option.value} className="group relative flex h-7 items-center gap-2 rounded-sm px-1">
              <span
                aria-hidden
                className="absolute inset-y-1 left-0 rounded-sm bg-hover"
                style={{ width: `${(count / max) * 100}%` }}
              />
              <Checkbox
                checked={selected.includes(option.value)}
                onChange={() => onChange(toggleItem(selected, option.value))}
                aria-label={`${typeof option.label === "string" ? option.label : option.value}, ${count} results`}
                className="relative"
              />
              <span
                className={`relative flex min-w-0 flex-1 items-center gap-1.5 truncate ${count === 0 ? "text-faint" : ""}`}
              >
                {option.label}
              </span>
              <span className="relative font-mono text-xs text-subtle group-hover:hidden">
                {count.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => onChange([option.value])}
                className="relative hidden cursor-pointer text-xs text-muted group-hover:block hover:text-ink"
              >
                only
              </button>
            </li>
          );
        })}
      </ul>

      {collapsedLimit && !search && matching.length > collapsedLimit && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="cursor-pointer px-1 pt-1 text-left text-xs text-muted hover:text-ink"
        >
          {isExpanded ? "Show fewer" : `Show all ${matching.length}`}
        </button>
      )}
    </section>
  );
}
