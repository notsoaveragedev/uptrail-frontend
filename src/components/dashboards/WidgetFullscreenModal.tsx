import { Modal } from "antd";
import type { DashboardRange, DashboardWidget } from "@/types/dashboard";
import { WidgetFrame } from "./WidgetFrame";

type WidgetFullscreenModalProps = {
  widget: DashboardWidget | null;
  range: DashboardRange;
  syncKey: string;
  onClose: () => void;
};

export function WidgetFullscreenModal({ widget, range, syncKey, onClose }: WidgetFullscreenModalProps) {
  return (
    <Modal
      open={widget !== null}
      onCancel={onClose}
      footer={null}
      title={null}
      width="90vw"
      destroyOnHidden
      classNames={{ body: "h-[75vh]" }}
    >
      {widget && (
        <WidgetFrame widget={widget} range={range} syncKey={`${syncKey}-fullscreen`} className="border-transparent" />
      )}
    </Modal>
  );
}
