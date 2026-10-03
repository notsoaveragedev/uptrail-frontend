import { Button, Tooltip } from "antd";
import type { ReactNode } from "react";

type KbdButtonProps = {
  label: string;
  hint: string;
  icon: ReactNode;
  onClick?: () => void;
};

export function KbdButton({ label, hint, icon, onClick }: KbdButtonProps) {
  return (
    <Tooltip
      title={
        <span className="flex items-center gap-2">
          {label} <kbd className="kbd">{hint}</kbd>
        </span>
      }
    >
      <Button type="text" size="small" aria-label={label} icon={icon} disabled={!onClick} onClick={onClick} />
    </Tooltip>
  );
}
