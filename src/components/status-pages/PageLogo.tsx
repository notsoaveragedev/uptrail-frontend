import { initials } from "@/lib/people";

type PageLogoProps = {
  title: string;
  logoUrl: string | null;
  color: string;
};

export function PageLogo({ title, logoUrl, color }: PageLogoProps) {
  if (logoUrl) return <img src={logoUrl} alt="" className="size-8 shrink-0 rounded-md object-contain" />;

  return (
    <span
      aria-hidden
      style={{ backgroundColor: color }}
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
    >
      {initials(title)}
    </span>
  );
}
