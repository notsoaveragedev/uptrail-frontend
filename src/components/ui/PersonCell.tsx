import { PersonAvatar } from "./PersonAvatar";

type PersonCellProps = {
  name: string;
  email?: string;
  isYou?: boolean;
  isMuted?: boolean;
};

export function PersonCell({ name, email, isYou = false, isMuted = false }: PersonCellProps) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <PersonAvatar name={name} size={email ? "default" : "small"} hasTooltip={false} />
      <span className="flex min-w-0 flex-col">
        <span className={`truncate ${isMuted ? "text-muted" : "font-medium text-ink"}`}>
          {name}
          {isYou && <span className="font-normal text-subtle"> (you)</span>}
        </span>
        {email && <span className="truncate text-xs text-subtle">{email}</span>}
      </span>
    </span>
  );
}
