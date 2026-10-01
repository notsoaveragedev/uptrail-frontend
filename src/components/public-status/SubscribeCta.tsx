import { SubscribeButton } from "./SubscribeButton";

type SubscribeCtaProps = {
  title: string;
  onSubscribe: (email: string) => Promise<void>;
};

export function SubscribeCta({ title, onSubscribe }: SubscribeCtaProps) {
  return (
    <aside className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-card px-4 py-3.5">
      <div className="flex flex-col gap-0.5">
        <p className="font-medium">Get notified about {title} incidents</p>
        <p className="text-xs text-muted">We'll email you when an incident is created, updated or resolved.</p>
      </div>
      <SubscribeButton title={title} isMobile={false} onSubscribe={onSubscribe} />
    </aside>
  );
}
