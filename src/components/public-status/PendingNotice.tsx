import { Loader } from "@/components/ui/Loader";

export function PendingNotice({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-card p-5 text-muted">
      <Loader label={label} />
      <span aria-hidden>{label}</span>
    </div>
  );
}
