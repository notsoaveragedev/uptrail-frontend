import { Button, Checkbox, Dropdown } from "antd";
import { useState, type ReactNode } from "react";
import { LuCirclePlus } from "react-icons/lu";

export type FacetOption = {
  value: string;
  label: ReactNode;
  count?: number;
};

type FacetFilterProps = {
  label: string;
  options: FacetOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

export function FacetFilter({ label, options, selected, onChange }: FacetFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  const items = [
    ...options.map((option) => ({
      key: option.value,
      label: (
        <span className="flex items-center gap-2.5">
          <Checkbox checked={selected.includes(option.value)} className="pointer-events-none" />
          <span className="flex flex-1 items-center gap-2">{option.label}</span>
          <span className="font-mono text-xs text-subtle">{option.count ?? 0}</span>
        </span>
      ),
    })),
    ...(selected.length > 0
      ? [{ type: "divider" as const }, { key: "__clear", label: <span className="text-muted">Clear filter</span> }]
      : []),
  ];

  return (
    <Dropdown
      trigger={["click"]}
      open={isOpen}
      onOpenChange={(open, info) => info.source === "trigger" && setIsOpen(open)}
      menu={{ items, onClick: ({ key }) => (key === "__clear" ? onChange([]) : toggle(key)) }}
      popupRender={(menu) => <div className="w-56">{menu}</div>}
    >
      <Button icon={<LuCirclePlus />} className={selected.length > 0 ? "" : "border-dashed"}>
        {label}
        {selected.length > 0 && (
          <span className="rounded-sm bg-hover px-1.5 font-mono text-xs text-ink">{selected.length}</span>
        )}
      </Button>
    </Dropdown>
  );
}
