import { Drawer } from "antd";
import { useState } from "react";
import { WidgetPreview } from "@/components/widgets/WidgetPreview";
import { CustomInput } from "@/components/ui/CustomInput";
import { filterWidgetDefinitions } from "@/lib/dashboards";
import { WIDGET_GROUPS } from "@/lib/widgets";
import type { WidgetDefinition, WidgetType } from "@/types/dashboard";

type AddWidgetDrawerProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType) => void;
};

export function AddWidgetDrawer({ open, onClose, onAdd }: AddWidgetDrawerProps) {
  const [query, setQuery] = useState("");
  const definitions = filterWidgetDefinitions(query);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add widget"
      placement="right"
      size="22rem"
      mask={false}
      classNames={{ body: "flex flex-col gap-4 p-4" }}
    >
      <CustomInput
        type="search"
        size="middle"
        aria-label="Search widgets"
        placeholder="Search widgets"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {definitions.length === 0 && <p className="text-muted">No widgets match “{query}”.</p>}
      {WIDGET_GROUPS.map((group) => {
        const items = definitions.filter((definition) => definition.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} aria-label={group} className="flex flex-col gap-1.5">
            <h3 className="text-caps font-semibold tracking-widest text-subtle uppercase">{group}</h3>
            <ul className="flex flex-col gap-1.5">
              {items.map((definition) => (
                <li key={definition.type}>
                  <WidgetOption definition={definition} onAdd={onAdd} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Drawer>
  );
}

function WidgetOption({ definition, onAdd }: { definition: WidgetDefinition; onAdd: (type: WidgetType) => void }) {
  const { w, h } = definition.defaultSize;

  return (
    <button
      type="button"
      onClick={() => onAdd(definition.type)}
      className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-line p-2 text-left transition-colors hover:border-line-strong hover:bg-hover"
    >
      <span className="h-12 w-18 shrink-0 overflow-hidden rounded-md border border-line bg-panel">
        <WidgetPreview type={definition.type} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium text-ink">{definition.label}</span>
          <span className="shrink-0 font-mono text-xs text-subtle">
            {w}×{h}
          </span>
        </span>
        <span className="text-xs text-muted">{definition.description}</span>
      </span>
    </button>
  );
}
