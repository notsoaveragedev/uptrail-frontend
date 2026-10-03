import { LuCpu, LuKeyRound } from "react-icons/lu";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import type { AuditEvent } from "@/types/audit";

export function AuditActor({ actor }: { actor: AuditEvent["actor"] }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {actor.type === "user" ? (
        <PersonAvatar name={actor.name} hasTooltip={false} />
      ) : (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-hover text-muted">
          {actor.type === "api_key" ? (
            <LuKeyRound aria-label="API key" className="size-3" />
          ) : (
            <LuCpu aria-label="System" className="size-3" />
          )}
        </span>
      )}
      <span className={`truncate ${actor.type === "system" ? "text-muted" : "text-ink"}`}>{actor.name}</span>
    </span>
  );
}
