import { SiTestrail } from "react-icons/si";

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-ink">
      <SiTestrail aria-hidden className="size-5.5 rotate-90 text-accent" />
      <span className="text-md font-semibold tracking-tight">uptrail</span>
    </span>
  );
}
