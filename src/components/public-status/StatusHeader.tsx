import { PageLogo } from "@/components/status-pages/PageLogo";
import type { StatusSnapshot } from "@/types/statusPage";
import { SubscribeButton } from "./SubscribeButton";

type StatusHeaderProps = {
  snapshot: StatusSnapshot;
  isMobile: boolean;
  onSubscribe: (email: string) => Promise<void>;
};

export function StatusHeader({ snapshot, isMobile, onSubscribe }: StatusHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <PageLogo title={snapshot.title} logoUrl={snapshot.logoUrl} color="var(--sp-primary)" />
        <div className="flex min-w-0 flex-col">
          <h1 tabIndex={-1} className="truncate text-lg font-semibold tracking-tight outline-none">
            {snapshot.title}
          </h1>
          {snapshot.description && !isMobile && <p className="truncate text-muted">{snapshot.description}</p>}
        </div>
      </div>
      <SubscribeButton title={snapshot.title} isMobile={isMobile} onSubscribe={onSubscribe} />
    </header>
  );
}
