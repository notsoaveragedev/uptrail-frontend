import { RowGrip as GripButton } from "@/components/ui/RowGrip";
import type { VisualNode } from "@/lib/alertExpression/visual";
import { gripId, nodeLabel, type Builder } from "./builderUtils";

type RowGripProps = {
  node: VisualNode;
  builder: Builder;
};

export function RowGrip({ node, builder }: RowGripProps) {
  return (
    <GripButton
      id={gripId(node.id)}
      label={`Reorder ${nodeLabel(node)}`}
      isPicked={builder.pickedId === node.id}
      describedBy={builder.instructionsId}
      onPointerDown={(event) => builder.startDrag(event, node.id)}
      onTogglePick={() => builder.togglePick(node)}
      onMove={(offset) => builder.moveBy(node, offset)}
    />
  );
}
