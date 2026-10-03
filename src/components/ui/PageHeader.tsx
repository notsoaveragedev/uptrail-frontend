import type { ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  titleSuffix?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  level?: 1 | 2;
};

export function PageHeader({ title, titleSuffix, meta, actions, level = 1 }: PageHeaderProps) {
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <Heading
          tabIndex={-1}
          className={`font-semibold tracking-tight outline-none ${level === 1 ? "text-lg" : "text-md"}`}
        >
          {title}
          {titleSuffix && <span className="text-subtle"> — {titleSuffix}</span>}
        </Heading>
        {meta && <div className="min-w-0 text-muted">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
