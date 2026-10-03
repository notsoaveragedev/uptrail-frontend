import type { PointerEvent } from "react";
import { countConditions, nodePosition, type VisualGroup, type VisualNode } from "@/lib/alertExpression/visual";
import { plural } from "@/lib/format";

export type Builder = {
  root: VisualGroup;
  pickedId: string | null;
  draggingId: string | null;
  instructionsId: string;
  change: (next: VisualGroup) => void;
  togglePick: (node: VisualNode) => void;
  moveBy: (node: VisualNode, offset: number) => void;
  remove: (node: VisualNode) => void;
  startDrag: (event: PointerEvent, id: string) => void;
};

export const COMBINATOR_OPTIONS = [
  { value: "and" as const, label: "ALL" },
  { value: "or" as const, label: "ANY" },
];

export function gripId(id: string) {
  return `grip-${id}`;
}

export function nodeLabel(node: VisualNode) {
  if (node.kind === "condition") return `condition ${node.metric} ${node.op} ${node.value ?? "empty"}`;
  const count = countConditions(node);
  return `group with ${plural(count, "condition")}`;
}

export function positionText(root: VisualGroup, id: string) {
  const position = nodePosition(root, id);
  return position ? `position ${position.index + 1} of ${position.count}` : "";
}
