import { App } from "antd";
import type { ReactNode } from "react";
import { PasswordConfirmField } from "@/components/ui/PasswordConfirmField";
import { TypeToConfirmField } from "@/components/ui/TypeToConfirmField";
import { fakeRequest } from "@/lib/fakeRequest";

type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  isDanger?: boolean;
  typeToConfirm?: { expected: string; consequences?: string[] };
  requirePassword?: boolean;
};

export function useConfirm() {
  const { modal } = App.useApp();

  return ({
    title,
    description,
    confirmLabel = "Confirm",
    isDanger = false,
    typeToConfirm,
    requirePassword = false,
  }: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      const needsInput = Boolean(typeToConfirm) || requirePassword;
      const setReady = (isReady: boolean) => dialog.update({ okButtonProps: { danger: isDanger, disabled: !isReady } });

      function content() {
        if (typeToConfirm) {
          return (
            <TypeToConfirmField
              expected={typeToConfirm.expected}
              description={description}
              consequences={typeToConfirm.consequences}
              onMatchChange={setReady}
            />
          );
        }
        if (requirePassword) {
          return (
            <PasswordConfirmField description={description} onChange={(password) => setReady(Boolean(password))} />
          );
        }
        return description;
      }

      const dialog = modal.confirm({
        title,
        content: content(),
        icon: null,
        width: needsInput ? "30rem" : "26rem",
        okText: confirmLabel,
        cancelText: "Cancel",
        okButtonProps: { danger: isDanger, disabled: needsInput },
        focusable: { autoFocusButton: needsInput ? null : "cancel" },
        onOk: async () => {
          if (requirePassword) await fakeRequest(500);
          resolve(true);
        },
        onCancel: () => resolve(false),
      });
    });
}
