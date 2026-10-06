import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { TONE_BADGE } from "@/lib/status";

type KpiCardProps = {
  icon: IconType;
  label: string;
  sublabel?: string;
  value: string;
  unit?: string;
  visual?: ReactNode;
  caption: ReactNode;
  pill?: ReactNode;
};

export function KpiCard({ icon: Icon, label, sublabel, value, unit, visual, caption, pill }: KpiCardProps) {
  return (
    <section className="flex flex-col rounded-lg border border-line bg-card transition-colors hover:border-line-strong">
      <div className="flex items-center gap-2 px-5 pt-4">
        <Icon aria-hidden className="size-3.5 text-subtle" />
        <h2 className="text-caps font-semibold tracking-widest text-muted uppercase">{label}</h2>
        {sublabel && <span className="ml-auto font-mono text-xs text-subtle">{sublabel}</span>}
      </div>
      <div className="flex flex-col gap-2 px-5 pt-3 pb-4">
        <p className="font-mono text-display font-medium tracking-tight">
          {value}
          {unit && <span className="ml-1 text-xs text-subtle">{unit}</span>}
        </p>
        {visual}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-5 py-2.5 font-mono text-xs text-subtle">
        {caption}
        {pill}
      </div>
    </section>
  );
}

export function DeltaPill({ tone, children }: { tone: "good" | "bad"; children: ReactNode }) {
  return <span className={`rounded-sm px-1.5 py-0.5 ${TONE_BADGE[tone === "good" ? "up" : "down"]}`}>{children}</span>;
}
