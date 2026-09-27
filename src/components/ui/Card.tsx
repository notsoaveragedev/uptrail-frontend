import type { ReactNode } from "react";

type CardProps = {
  title?: ReactNode;
  extra?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Card({ title, extra, className = "", children }: CardProps) {
  return (
    <section className={`flex flex-col rounded-lg border border-line bg-card ${className}`}>
      {(title || extra) && (
        <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
          <h2 className="flex items-center gap-2 text-md font-semibold">{title}</h2>
          {extra}
        </header>
      )}
      {children}
    </section>
  );
}
