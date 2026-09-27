import { Checkbox, Dropdown } from "antd";
import { useState, type ReactNode } from "react";
import { toggleItem } from "@/lib/list";
import type { FacetOption } from "@/types/facet";

type CheckboxMenuProps = {
  options: FacetOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  footer?: { label: string; onClick: () => void };
  widthClassName?: string;
  children: ReactNode;
};

const FOOTER_KEY = "__footer";

export function CheckboxMenu({
  options,
  selected,
  onChange,
  footer,
  widthClassName = "w-56",
  children,
}: CheckboxMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    ...options.map((option) => ({
      key: option.value,
      label: (
        <span className="flex items-center gap-2.5">
          <Checkbox checked={selected.includes(option.value)} className="pointer-events-none" />
          <span className="flex flex-1 items-center gap-2">{option.label}</span>
          {option.count !== undefined && <span className="font-mono text-xs text-subtle">{option.count}</span>}
        </span>
      ),
    })),
    ...(footer
      ? [{ type: "divider" as const }, { key: FOOTER_KEY, label: <span className="text-muted">{footer.label}</span> }]
      : []),
  ];

  return (
    <Dropdown
      trigger={["click"]}
      open={isOpen}
      onOpenChange={(open, info) => info.source === "trigger" && setIsOpen(open)}
      menu={{
        items,
        onClick: ({ key }) => (key === FOOTER_KEY ? footer?.onClick() : onChange(toggleItem(selected, key))),
      }}
      popupRender={(menu) => <div className={widthClassName}>{menu}</div>}
    >
      {children}
    </Dropdown>
  );
}
