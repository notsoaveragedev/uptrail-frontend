import { memo, type ReactNode } from "react";
import { LuChevronRight } from "react-icons/lu";
import { rowOffset } from "@/lib/dataGrid";

type GroupRowProps = {
  groupKey: string;
  content: ReactNode;
  index: number;
  colCount: number;
  isExpanded: boolean;
  isFocused: boolean;
  onToggle: (key: string) => void;
};

function GroupRowComponent({ groupKey, content, index, colCount, isExpanded, isFocused, onToggle }: GroupRowProps) {
  return (
    <div
      role="row"
      aria-rowindex={index + 2}
      aria-level={1}
      aria-expanded={isExpanded}
      className="absolute inset-x-0 top-0 flex h-8 cursor-pointer border-b border-line bg-panel hover:bg-hover"
      style={rowOffset(index)}
      onClick={() => onToggle(groupKey)}
    >
      <div
        role="gridcell"
        aria-colindex={1}
        aria-colspan={colCount}
        tabIndex={isFocused ? 0 : -1}
        data-cell
        data-index={index}
        className="flex h-full w-full items-center outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--muted)]"
      >
        <div className="sticky left-0 flex h-full min-w-0 items-center gap-2 px-3">
          <LuChevronRight
            aria-hidden
            className={`size-3.5 shrink-0 text-subtle transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
          {content}
        </div>
      </div>
    </div>
  );
}

export const GroupRow = memo(GroupRowComponent);
