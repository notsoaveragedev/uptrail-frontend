import { App } from "antd";
import type { ReactNode } from "react";
import { TypeToConfirmField } from "@/components/ui/TypeToConfirmField";

type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  isDanger?: boolean;
  typeToConfirm?: { expected: string; consequences?: string[] };
};

export function useConfirm() {
  const { modal } = App.useApp();

  return ({ title, description, confirmLabel = "Confirm", isDanger = false, typeToConfirm }: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      const dialog = modal.confirm({
        title,
        content: typeToConfirm ? (
          <TypeToConfirmField
            expected={typeToConfirm.expected}
            description={description}
            consequences={typeToConfirm.consequences}
            onMatchChange={(isMatch) => dialog.update({ okButtonProps: { danger: isDanger, disabled: !isMatch } })}
          />
        ) : (
          description
        ),
        icon: null,
        width: typeToConfirm ? "30rem" : "26rem",
        okText: confirmLabel,
        cancelText: "Cancel",
        okButtonProps: { danger: isDanger, disabled: Boolean(typeToConfirm) },
        focusable: { autoFocusButton: typeToConfirm ? null : "cancel" },
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
}
