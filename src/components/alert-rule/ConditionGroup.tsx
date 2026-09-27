import { Button, Segmented, Tooltip } from "antd";
import { LuPlus } from "react-icons/lu";
import {
  addCondition,
  addGroup,
  canAddGroup,
  MAX_DEPTH,
  setCombinator,
  type VisualGroup,
} from "@/lib/alertExpression/visual";
import { COMBINATOR_OPTIONS, type Builder } from "./builderUtils";
import { ConditionRow } from "./ConditionRow";
import { RowActions } from "./RowActions";
import { RowGrip } from "./RowGrip";

type ConditionGroupProps = {
  group: VisualGroup;
  builder: Builder;
  isRoot?: boolean;
};

function rowState(builder: Builder, id: string) {
  if (builder.draggingId === id) return "relative z-10 rounded-md bg-hover shadow-overlay";
  if (builder.pickedId === id) return "rounded-md bg-hover outline outline-1 outline-line-strong outline-dashed";
  return "";
}

export function ConditionGroup({ group, builder, isRoot = false }: ConditionGroupProps) {
  const canNest = canAddGroup(builder.root, group.id);

  return (
    <div className="flex flex-col gap-2 border-l-2 border-line-strong py-0.5 pl-3">
      <div className="group/row flex items-center gap-2">
        {!isRoot && <RowGrip node={group} builder={builder} />}
        <Segmented
          size="small"
          aria-label="Match"
          value={group.combinator}
          onChange={(combinator) => builder.change(setCombinator(builder.root, group.id, combinator))}
          options={COMBINATOR_OPTIONS}
        />
        <span className="text-muted">of the following</span>
        {!isRoot && (
          <span className="ml-auto">
            <RowActions node={group} builder={builder} />
          </span>
        )}
      </div>

      {group.children.length > 0 && (
        <ul className="flex flex-col gap-2">
          {group.children.map((child) => (
            <li
              key={child.id}
              data-node={child.id}
              data-parent={group.id}
              className={`transition-shadow ${rowState(builder, child.id)}`}
            >
              {child.kind === "group" ? (
                <ConditionGroup group={child} builder={builder} />
              ) : (
                <ConditionRow condition={child} builder={builder} />
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-1">
        <Button
          type="text"
          size="small"
          icon={<LuPlus />}
          onClick={() => builder.change(addCondition(builder.root, group.id))}
          className="text-muted"
        >
          Condition
        </Button>
        <Tooltip title={canNest ? null : `Groups can nest ${MAX_DEPTH} levels deep`}>
          <Button
            type="text"
            size="small"
            icon={<LuPlus />}
            disabled={!canNest}
            onClick={() => builder.change(addGroup(builder.root, group.id))}
            className="text-muted"
          >
            Group
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
