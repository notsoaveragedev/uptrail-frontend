import type { ReactNode } from "react";
import { TONE_BADGE, type Tone } from "@/lib/status";

type PublicNoticeProps = {
  tone: Tone;
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export function PublicNotice({ tone, icon, title, children, actions }: PublicNoticeProps) {
  return (
    <section role="status" className="flex gap-4 rounded-lg border border-line bg-card p-5">
      <span
        aria-hidden
        className={`flex size-9 shrink-0 items-center justify-center rounded-md [&_svg]:size-4.5 ${TONE_BADGE[tone]}`}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 tabIndex={-1} className="text-md font-semibold outline-none">
          {title}
        </h1>
        {children && <div className="text-muted">{children}</div>}
        {actions && <div className="mt-3 flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </section>
  );
}
