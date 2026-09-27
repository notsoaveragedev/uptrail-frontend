import { Button } from "antd";
import { LuCirclePlus } from "react-icons/lu";
import { CheckboxMenu } from "@/components/ui/CheckboxMenu";
import { CountBadge } from "@/components/ui/CountBadge";
import type { FacetOption } from "@/types/facet";

type FacetFilterProps = {
  label: string;
  options: FacetOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

export function FacetFilter({ label, options, selected, onChange }: FacetFilterProps) {
  const hasSelection = selected.length > 0;

  return (
    <CheckboxMenu
      options={options.map((option) => ({ ...option, count: option.count ?? 0 }))}
      selected={selected}
      onChange={onChange}
      footer={hasSelection ? { label: "Clear filter", onClick: () => onChange([]) } : undefined}
    >
      <Button icon={<LuCirclePlus />} className={hasSelection ? "" : "border-dashed"}>
        {label}
        {hasSelection && <CountBadge count={selected.length} />}
      </Button>
    </CheckboxMenu>
  );
}
