import type { ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  titleSuffix?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, titleSuffix, meta, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 tabIndex={-1} className="text-lg font-semibold tracking-tight outline-none">
          {title}
          {titleSuffix && <span className="text-subtle"> — {titleSuffix}</span>}
        </h1>
        {meta && <div className="min-w-0 text-muted">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
