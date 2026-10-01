import { Button } from "antd";
import type { KeyboardEvent, PointerEvent } from "react";
import { LuGripVertical } from "react-icons/lu";

type RowGripProps = {
  id: string;
  label: string;
  isPicked: boolean;
  describedBy: string;
  onPointerDown: (event: PointerEvent) => void;
  onTogglePick: () => void;
  onMove: (offset: number) => void;
};

const MOVES: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };

export function RowGrip({ id, label, isPicked, describedBy, onPointerDown, onTogglePick, onMove }: RowGripProps) {
  function handleKeyDown(event: KeyboardEvent) {
    if (!isPicked) return;
    if (event.key in MOVES) {
      event.preventDefault();
      onMove(MOVES[event.key]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onTogglePick();
    }
  }

  return (
    <Button
      id={id}
      type="text"
      size="small"
      aria-label={label}
      aria-pressed={isPicked}
      aria-describedby={describedBy}
      icon={<LuGripVertical aria-hidden />}
      onPointerDown={onPointerDown}
      onClick={(event) => {
        if (event.detail === 0) onTogglePick();
      }}
      onKeyDown={handleKeyDown}
      className={`shrink-0 cursor-grab touch-none active:cursor-grabbing ${isPicked ? "bg-hover text-ink" : "text-subtle"}`}
    />
  );
}
