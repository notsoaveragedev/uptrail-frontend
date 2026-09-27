import { Button, Drawer } from "antd";
import { Suspense, useState } from "react";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { isWidgetValid } from "@/lib/dashboards";
import { WIDGETS } from "@/lib/widgets";
import type { DashboardRange, DashboardWidget } from "@/types/dashboard";
import { WidgetFrame } from "./WidgetFrame";

type WidgetConfigDrawerProps = {
  widget: DashboardWidget | null;
  range: DashboardRange;
  syncKey: string;
  onApply: (widget: DashboardWidget) => void;
  onClose: () => void;
};

export function WidgetConfigDrawer({ widget, range, syncKey, onApply, onClose }: WidgetConfigDrawerProps) {
  return (
    <Drawer
      open={widget !== null}
      onClose={onClose}
      title={widget ? `Configure ${WIDGETS[widget.type].label}` : "Configure widget"}
      placement="right"
      size="40rem"
      destroyOnHidden
      classNames={{ body: "p-0" }}
    >
      {widget && (
        <ConfigForm
          key={widget.id}
          widget={widget}
          range={range}
          syncKey={syncKey}
          onApply={onApply}
          onClose={onClose}
        />
      )}
    </Drawer>
  );
}

type ConfigFormProps = Omit<WidgetConfigDrawerProps, "widget"> & { widget: DashboardWidget };

function ConfigForm({ widget, range, syncKey, onApply, onClose }: ConfigFormProps) {
  const [draft, setDraft] = useState(widget);
  const { ConfigFields } = WIDGETS[draft.type];
  const isValid = isWidgetValid(draft);
  const isChanged = draft !== widget;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line bg-panel p-4">
        <div className="h-56">
          <WidgetFrame widget={draft} range={range} syncKey={`${syncKey}-config`} isPreview className="border-line" />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <SectionErrorBoundary>
          <Suspense fallback={<SkeletonBlock isInset className="h-64" />}>
            <ConfigFields widget={draft} onChange={setDraft} />
          </Suspense>
        </SectionErrorBoundary>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-4 py-3">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" disabled={!isValid || !isChanged} onClick={() => onApply(draft)}>
          Apply
        </Button>
      </div>
    </div>
  );
}
