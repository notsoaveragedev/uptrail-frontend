import { Select, type SelectProps } from "antd";
import { useCurrentRole } from "@/hooks/usePermission";
import { INHERIT_ROLE } from "@/lib/members";
import { canGrantRole } from "@/lib/permissions";
import type { Role } from "@/types/rbac";

type RoleSelectProps = Omit<SelectProps<string>, "options"> & {
  roles: Role[];
  inheritLabel?: string;
};

export function RoleSelect({ roles, inheritLabel, ...props }: RoleSelectProps) {
  const { granted } = useCurrentRole();

  function option(role: Role) {
    const check = canGrantRole(granted, role);
    return {
      value: role.id,
      label: role.name,
      disabled: !check.allowed,
      title: check.reason ?? role.description,
    };
  }

  return (
    <Select<string>
      {...props}
      popupMatchSelectWidth={false}
      options={[
        ...(inheritLabel ? [{ value: INHERIT_ROLE, label: inheritLabel }] : []),
        { label: "Built-in", options: roles.filter((role) => role.isSystem).map(option) },
        ...(roles.some((role) => !role.isSystem)
          ? [{ label: "Custom", options: roles.filter((role) => !role.isSystem).map(option) }]
          : []),
      ]}
    />
  );
}
