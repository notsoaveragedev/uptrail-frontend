import { Button } from "antd";
import type { KeyboardEvent } from "react";
import { LuGripVertical } from "react-icons/lu";
import type { VisualNode } from "@/lib/alertExpression/visual";
import { gripId, nodeLabel, type Builder } from "./builderUtils";

type RowGripProps = {
  node: VisualNode;
  builder: Builder;
};

const MOVES: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };

export function RowGrip({ node, builder }: RowGripProps) {
  const isPicked = builder.pickedId === node.id;

  function handleKeyDown(event: KeyboardEvent) {
    if (!isPicked) return;
    if (event.key in MOVES) {
      event.preventDefault();
      builder.moveBy(node, MOVES[event.key]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      builder.togglePick(node);
    }
  }

  return (
    <Button
      id={gripId(node.id)}
      type="text"
      size="small"
      aria-label={`Reorder ${nodeLabel(node)}`}
      aria-pressed={isPicked}
      aria-describedby={builder.instructionsId}
      icon={<LuGripVertical aria-hidden />}
      onPointerDown={(event) => builder.startDrag(event, node.id)}
      onClick={(event) => {
        if (event.detail === 0) builder.togglePick(node);
      }}
      onKeyDown={handleKeyDown}
      className={`shrink-0 cursor-grab touch-none active:cursor-grabbing ${isPicked ? "bg-hover text-ink" : "text-subtle"}`}
    />
  );
}
