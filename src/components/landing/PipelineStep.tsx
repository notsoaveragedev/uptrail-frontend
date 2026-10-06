import type { ReactNode } from "react";

type PipelineStepProps = {
  time: string;
  title: string;
  children: ReactNode;
};

export function PipelineStep({ time, title, children }: PipelineStepProps) {
  return (
    <li className="flex min-w-0 flex-col gap-4 rounded-lg border border-line bg-card p-5 transition-colors hover:border-line-strong">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-subtle">{time}</span>
        <h3 className="text-md font-semibold">{title}</h3>
      </div>
      {children}
    </li>
  );
}
