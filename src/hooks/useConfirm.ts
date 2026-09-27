import { App } from "antd";
import type { ReactNode } from "react";

type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  isDanger?: boolean;
};

export function useConfirm() {
  const { modal } = App.useApp();

  return ({ title, description, confirmLabel = "Confirm", isDanger = false }: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      modal.confirm({
        title,
        content: description,
        icon: null,
        width: "26rem",
        okText: confirmLabel,
        cancelText: "Cancel",
        okButtonProps: { danger: isDanger },
        autoFocusButton: "cancel",
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
}
