import type { ReactNode } from "react";

type DrawerSectionProps = {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
};

export function DrawerSection({ title, extra, children }: DrawerSectionProps) {
  return (
    <section className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-b-0">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-caps font-medium tracking-wider text-subtle uppercase">{title}</h3>
        {extra}
      </header>
      {children}
    </section>
  );
}
