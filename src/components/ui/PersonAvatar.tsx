import { Avatar, Tooltip } from "antd";
import { initials } from "@/lib/people";

type PersonAvatarProps = {
  name: string | null;
  size?: "small" | "default";
  hasTooltip?: boolean;
};

export function PersonAvatar({ name, size = "small", hasTooltip = true }: PersonAvatarProps) {
  if (!name) return <span className="text-subtle">—</span>;

  const avatar = (
    <Avatar
      size={size}
      aria-label={hasTooltip ? name : undefined}
      className={`shrink-0 bg-hover font-semibold text-muted ${size === "small" ? "text-caps" : "text-xs"}`}
    >
      {initials(name)}
    </Avatar>
  );
  return hasTooltip ? <Tooltip title={name}>{avatar}</Tooltip> : avatar;
}
