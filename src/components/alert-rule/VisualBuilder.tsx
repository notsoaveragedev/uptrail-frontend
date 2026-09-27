import { useId, useLayoutEffect, useState } from "react";
import { useConfirm } from "@/hooks/useConfirm";
import {
  countConditions,
  moveNode,
  moveNodeTo,
  nodePosition,
  removeNode,
  type VisualGroup,
  type VisualNode,
} from "@/lib/alertExpression/visual";
import { gripId, nodeLabel, positionText, type Builder } from "./builderUtils";
import { ConditionGroup } from "./ConditionGroup";
import { useRowDrag } from "./useRowDrag";

type VisualBuilderProps = {
  tree: VisualGroup;
  onChange: (tree: VisualGroup) => void;
};

export function VisualBuilder({ tree, onChange }: VisualBuilderProps) {
  const confirm = useConfirm();
  const instructionsId = useId();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const { draggingId, startDrag } = useRowDrag((id, index) => {
    if (nodePosition(tree, id)?.index !== index) onChange(moveNodeTo(tree, id, index));
  });

  useLayoutEffect(() => {
    if (pickedId) document.getElementById(gripId(pickedId))?.focus();
  }, [tree, pickedId]);

  function togglePick(node: VisualNode) {
    const isDropping = pickedId === node.id;
    setPickedId(isDropping ? null : node.id);
    setAnnouncement(
      isDropping
        ? `Dropped ${nodeLabel(node)} at ${positionText(tree, node.id)}.`
        : `Picked up ${nodeLabel(node)}, ${positionText(tree, node.id)}. Use the arrow keys to move it and Space to drop.`,
    );
  }

  function moveBy(node: VisualNode, offset: number) {
    const next = moveNode(tree, node.id, offset);
    onChange(next);
    setAnnouncement(`Moved to ${positionText(next, node.id)}.`);
  }

  async function remove(node: VisualNode) {
    const count = node.kind === "group" ? countConditions(node) : 0;
    if (count > 0) {
      const isConfirmed = await confirm({
        title: "Remove this group?",
        description: `The ${count} ${count === 1 ? "condition" : "conditions"} inside it will be removed too.`,
        confirmLabel: "Remove group",
        isDanger: true,
      });
      if (!isConfirmed) return;
    }
    if (pickedId === node.id) setPickedId(null);
    onChange(removeNode(tree, node.id));
  }

  const builder: Builder = {
    root: tree,
    pickedId,
    draggingId,
    instructionsId,
    change: onChange,
    togglePick,
    moveBy,
    remove,
    startDrag,
  };

  return (
    <div className="flex flex-col">
      <ConditionGroup group={tree} builder={builder} isRoot />
      <p id={instructionsId} className="sr-only">
        Press Space to pick up, the arrow keys to move, and Space again to drop.
      </p>
      <p aria-live="assertive" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
