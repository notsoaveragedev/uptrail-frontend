import { App } from "antd";
import type { ReactNode } from "react";
import { LuCircleAlert, LuCircleCheck, LuCircleX, LuInfo, LuX } from "react-icons/lu";

type ToastType = "success" | "error" | "warning" | "info";

type ToastAction = {
  label: string;
  onClick: () => void;
};

const TOAST_ICONS: Record<ToastType, ReactNode> = {
  success: <LuCircleCheck className="text-up" />,
  error: <LuCircleX className="text-down" />,
  warning: <LuCircleAlert className="text-degraded" />,
  info: <LuInfo className="text-maintenance" />,
};

export function useToast() {
  const { notification } = App.useApp();

  function show(type: ToastType, title: string, description?: string, action?: ToastAction) {
    notification.open({
      icon: null,
      title: (
        <span className="flex gap-3">
          <span className="mt-0.5 flex shrink-0 [&_svg]:size-4" aria-hidden>
            {TOAST_ICONS[type]}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-medium text-ink">{title}</span>
            {description && <span className="text-xs text-muted">{description}</span>}
            {action && (
              <button
                type="button"
                onClick={action.onClick}
                className="mt-2 w-fit cursor-pointer text-xs font-medium text-accent hover:text-accent-hover"
              >
                {action.label}
              </button>
            )}
          </span>
        </span>
      ),
      closeIcon: <LuX className="size-3.5" />,
      pauseOnHover: true,
      duration: type === "error" ? 6 : 4,
      role: type === "error" || type === "warning" ? "alert" : "status",
      classNames: {
        root: "rounded-lg border border-line-strong bg-tooltip py-3 pr-10 pl-3.5 shadow-overlay",
        title: "m-0",
        description: "hidden",
      },
    });
  }

  return {
    success: (title: string, description?: string, action?: ToastAction) => show("success", title, description, action),
    error: (title: string, description?: string, action?: ToastAction) => show("error", title, description, action),
    warning: (title: string, description?: string, action?: ToastAction) => show("warning", title, description, action),
    info: (title: string, description?: string, action?: ToastAction) => show("info", title, description, action),
  };
}
