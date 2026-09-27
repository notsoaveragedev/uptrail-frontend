import { Segmented, Tooltip } from "antd";
import { LuCode, LuListTree } from "react-icons/lu";
import type { ConditionMode } from "./ruleFormUtils";

type ConditionModeToggleProps = {
  mode: ConditionMode;
  visualBlockedReason: string | null;
  onChange: (mode: ConditionMode) => void;
};

export function ConditionModeToggle({ mode, visualBlockedReason, onChange }: ConditionModeToggleProps) {
  const isVisualBlocked = mode === "text" && visualBlockedReason !== null;

  return (
    <Segmented<ConditionMode>
      size="small"
      aria-label="Condition editor"
      value={mode}
      onChange={onChange}
      options={[
        {
          value: "visual",
          disabled: isVisualBlocked,
          label: (
            <Tooltip title={isVisualBlocked ? visualBlockedReason : null}>
              <span className="flex items-center gap-1.5">
                <LuListTree aria-hidden />
                Visual
              </span>
            </Tooltip>
          ),
        },
        {
          value: "text",
          label: (
            <span className="flex items-center gap-1.5">
              <LuCode aria-hidden />
              Text
            </span>
          ),
        },
      ]}
    />
  );
}
