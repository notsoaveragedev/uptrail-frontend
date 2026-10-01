import { Avatar, Tooltip } from "antd";
import { initials } from "@/lib/incidents";

type AssigneeAvatarProps = {
  name: string | null;
  hasTooltip?: boolean;
};

export function AssigneeAvatar({ name, hasTooltip = true }: AssigneeAvatarProps) {
  if (!name) return <span className="text-subtle">—</span>;

  const avatar = (
    <Avatar
      size="small"
      aria-label={hasTooltip ? name : undefined}
      className="shrink-0 bg-hover text-caps font-semibold text-muted"
    >
      {initials(name)}
    </Avatar>
  );
  return hasTooltip ? <Tooltip title={name}>{avatar}</Tooltip> : avatar;
}
