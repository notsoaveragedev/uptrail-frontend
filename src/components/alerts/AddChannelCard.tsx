import { LuPlus } from "react-icons/lu";

export function AddChannelCard({ isEmpty, onClick }: { isEmpty: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong text-muted transition-colors hover:border-subtle hover:text-ink focus-visible:border-subtle"
    >
      <LuPlus className="size-4" />
      <span className="font-medium">{isEmpty ? "Add where alerts go." : "Add channel"}</span>
      <span className="text-xs text-subtle">Email, Slack, Discord or a webhook</span>
    </button>
  );
}
