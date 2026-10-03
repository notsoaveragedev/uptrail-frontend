import { Button } from "antd";
import type { ReactNode } from "react";
import { LuX } from "react-icons/lu";
import { useWindowKeydown } from "@/hooks/useWindowKeydown";
import { CountBadge } from "./CountBadge";
import { ToolbarDivider } from "./ToolbarDivider";

type SelectionBarProps = {
  count: number;
  onClear: () => void;
  children: ReactNode;
};

export function SelectionBar({ count, onClear, children }: SelectionBarProps) {
  useWindowKeydown((event) => {
    if (event.key === "Escape" && count > 0) onClear();
  });

  if (count === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-line-strong bg-tooltip p-1.5 shadow-overlay lg:left-[calc(50%+7.5rem)]"
    >
      <span className="flex items-center gap-2 px-2 text-muted">
        <CountBadge count={count} />
        selected
      </span>
      <ToolbarDivider />
      {children}
      <kbd className="kbd ml-1">Esc</kbd>
      <Button type="text" aria-label="Clear selection" icon={<LuX />} onClick={onClear} />
    </div>
  );
}
