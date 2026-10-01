import { PageLogo } from "@/components/status-pages/PageLogo";

export function BrandMark({ title, logoUrl }: { title: string; logoUrl: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <PageLogo title={title} logoUrl={logoUrl} color="var(--sp-primary)" />
      <span className="text-md font-semibold tracking-tight">{title}</span>
    </div>
  );
}
