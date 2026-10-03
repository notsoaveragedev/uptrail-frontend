import { Button, Dropdown } from "antd";
import { LuShieldCheck, LuUserMinus } from "react-icons/lu";
import { SelectionBar } from "@/components/ui/SelectionBar";
import { ToolbarDivider } from "@/components/ui/ToolbarDivider";
import { useCurrentRole } from "@/hooks/usePermission";
import { findRole } from "@/lib/members";
import { canGrantRole } from "@/lib/permissions";
import type { Member } from "@/types/member";
import type { Role } from "@/types/rbac";
import { useMemberActions } from "./useMemberActions";

type MemberBulkBarProps = {
  selected: Member[];
  roles: Role[];
  onClear: () => void;
};

export function MemberBulkBar({ selected, roles, onClear }: MemberBulkBarProps) {
  const actions = useMemberActions();
  const { granted } = useCurrentRole();

  async function remove() {
    if (await actions.remove(selected)) onClear();
  }

  return (
    <SelectionBar count={selected.length} onClear={onClear}>
      <Dropdown
        trigger={["click"]}
        menu={{
          items: roles.map((role) => ({
            key: role.id,
            label: role.name,
            disabled: !canGrantRole(granted, role).allowed,
          })),
          onClick: async ({ key }) => {
            const role = findRole(roles, key);
            if (role && (await actions.changeRole(selected, role))) onClear();
          },
        }}
      >
        <Button type="text" icon={<LuShieldCheck />}>
          Change role
        </Button>
      </Dropdown>
      <ToolbarDivider />
      <Button type="text" danger icon={<LuUserMinus />} onClick={remove}>
        Remove
      </Button>
    </SelectionBar>
  );
}
