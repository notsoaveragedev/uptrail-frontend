import type { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="grid gap-4 border-t border-line py-6 first:border-t-0 first:pt-0 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-semibold">{title}</h3>
        <p className="text-muted">{description}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
    </section>
  );
}
