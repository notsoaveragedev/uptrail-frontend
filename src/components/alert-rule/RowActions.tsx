import { Button, Dropdown } from "antd";
import { LuArrowDown, LuArrowUp, LuEllipsis, LuTrash2, LuX } from "react-icons/lu";
import { nodePosition, type VisualNode } from "@/lib/alertExpression/visual";
import { nodeLabel, type Builder } from "./builderUtils";

type RowActionsProps = {
  node: VisualNode;
  builder: Builder;
};

export function RowActions({ node, builder }: RowActionsProps) {
  const position = nodePosition(builder.root, node.id);
  const isFirst = position?.index === 0;
  const isLast = position ? position.index === position.count - 1 : true;
  const label = nodeLabel(node);

  return (
    <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
      <Dropdown
        trigger={["click"]}
        menu={{
          items: [
            { key: "up", label: "Move up", icon: <LuArrowUp />, disabled: isFirst },
            { key: "down", label: "Move down", icon: <LuArrowDown />, disabled: isLast },
            { type: "divider" },
            { key: "remove", label: "Remove", icon: <LuTrash2 />, danger: true },
          ],
          onClick: ({ key }) => {
            if (key === "remove") builder.remove(node);
            else builder.moveBy(node, key === "up" ? -1 : 1);
          },
        }}
      >
        <Button type="text" size="small" aria-label={`More actions for ${label}`} icon={<LuEllipsis />} />
      </Dropdown>
      <Button
        type="text"
        size="small"
        aria-label={`Remove ${label}`}
        icon={<LuX />}
        onClick={() => builder.remove(node)}
        className="text-subtle"
      />
    </div>
  );
}
