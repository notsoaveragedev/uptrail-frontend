import { LuGlobe } from "react-icons/lu";

export function PublicBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-line-strong px-1 text-caps font-semibold tracking-widest text-muted uppercase">
      <LuGlobe aria-hidden className="size-2.5" />
      Public
    </span>
  );
}
