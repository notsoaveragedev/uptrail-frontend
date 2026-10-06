import type { ReactNode } from "react";

type BentoCardProps = {
  title: string;
  body: string;
  className?: string;
  children: ReactNode;
};

export function BentoCard({ title, body, className = "", children }: BentoCardProps) {
  return (
    <article
      className={`flex min-w-0 flex-col gap-6 rounded-lg border border-line bg-card p-6 transition-colors hover:border-line-strong ${className}`}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="max-w-md text-body text-pretty text-muted">{body}</p>
      </div>
      <div className="mt-auto min-w-0">{children}</div>
    </article>
  );
}
