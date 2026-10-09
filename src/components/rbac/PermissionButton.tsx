import { Button, Tooltip, type ButtonProps } from "antd";
import { usePermission } from "@/hooks/usePermission";

export function PermissionButton({ permission, ...props }: ButtonProps & { permission: string }) {
  const check = usePermission(permission);
  if (check.allowed) return <Button {...props} />;

  return (
    <Tooltip title={check.reason}>
      <span className="inline-flex">
        <Button {...props} disabled />
      </span>
    </Tooltip>
  );
}
