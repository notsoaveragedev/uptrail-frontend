import { Button } from "antd";
import { LuColumns3 } from "react-icons/lu";
import { CheckboxMenu } from "@/components/ui/CheckboxMenu";
import { defaultLogColumnState, LOG_COLUMN_LABELS } from "@/lib/logColumns";
import type { ColumnState } from "@/types/dataGrid";

type ColumnsMenuProps = {
  columnState: ColumnState;
  onChange: (state: ColumnState) => void;
};

export function ColumnsMenu({ columnState, onChange }: ColumnsMenuProps) {
  const keys = columnState.order.filter((key) => key in LOG_COLUMN_LABELS);

  return (
    <CheckboxMenu
      options={keys.map((key) => ({ value: key, label: LOG_COLUMN_LABELS[key] }))}
      selected={keys.filter((key) => !columnState.hidden.includes(key))}
      onChange={(visible) => onChange({ ...columnState, hidden: keys.filter((key) => !visible.includes(key)) })}
      footer={{ label: "Reset columns", onClick: () => onChange(defaultLogColumnState) }}
      widthClassName="w-52"
    >
      <Button icon={<LuColumns3 />}>Columns</Button>
    </CheckboxMenu>
  );
}
