import type { ReactNode } from "react";

type CardProps = {
  title?: ReactNode;
  meta?: ReactNode;
  extra?: ReactNode;
  isInteractive?: boolean;
  className?: string;
  children: ReactNode;
};

export function Card({ title, meta, extra, isInteractive = false, className = "", children }: CardProps) {
  return (
    <section
      className={`flex flex-col rounded-lg border border-line bg-card ${isInteractive ? "transition-colors hover:border-line-strong" : ""} ${className}`}
    >
      {(title || extra) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3">
          <h2 className="flex items-center gap-2 text-md font-semibold">
            {title}
            {meta !== undefined && <span className="font-mono text-xs font-normal text-subtle">{meta}</span>}
          </h2>
          {extra}
        </header>
      )}
      {children}
    </section>
  );
}
