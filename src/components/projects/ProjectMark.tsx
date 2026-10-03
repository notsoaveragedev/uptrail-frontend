import { initials } from "@/lib/people";

export function ProjectMark({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-hover text-xs font-semibold text-muted"
    >
      {initials(name)}
    </span>
  );
}
