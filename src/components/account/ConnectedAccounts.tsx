import { Button, Tooltip } from "antd";
import type { IconType } from "react-icons";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useSaveSecurity } from "@/api/account";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { canUnlinkProvider, linkProvider } from "@/lib/account";
import { formatDay } from "@/lib/format";
import type { OAuthProvider, SecurityState } from "@/types/account";

const PROVIDERS: { key: OAuthProvider; label: string; icon: IconType; handle: string }[] = [
  { key: "github", label: "GitHub", icon: FaGithub, handle: "meera-iyer" },
  { key: "google", label: "Google", icon: FcGoogle, handle: "meera@pixelcraft.io" },
];

export function ConnectedAccounts({ security }: { security: SecurityState }) {
  const toast = useToast();
  const confirm = useConfirm();
  const save = useSaveSecurity();
  const unlinkCheck = canUnlinkProvider(security);

  function connect(provider: (typeof PROVIDERS)[number]) {
    save.mutate(linkProvider(security, provider.key, provider.handle));
    toast.success(`${provider.label} connected`, `You can now sign in with ${provider.label}.`);
  }

  async function disconnect(provider: (typeof PROVIDERS)[number]) {
    const isConfirmed = await confirm({
      title: `Disconnect ${provider.label}?`,
      description: `You won't be able to sign in with ${provider.label} until you connect it again.`,
      confirmLabel: "Disconnect",
      isDanger: true,
    });
    if (!isConfirmed) return;
    save.mutate({ ...security, connected: security.connected.filter((item) => item.provider !== provider.key) });
    toast.success(`${provider.label} disconnected`);
  }

  return (
    <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
      {PROVIDERS.map((provider) => {
        const linked = security.connected.find((item) => item.provider === provider.key);
        const Icon = provider.icon;
        return (
          <li key={provider.key} className="flex items-center gap-3 px-3 py-2.5">
            <Icon aria-hidden className="size-5 shrink-0" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium text-ink">{provider.label}</span>
              <span className="truncate text-xs text-subtle">
                {linked ? `${linked.handle} · linked ${formatDay(linked.linkedAt)}` : "Not connected"}
              </span>
            </span>
            {linked ? (
              <Tooltip title={unlinkCheck.reason}>
                <Button disabled={!unlinkCheck.allowed} onClick={() => disconnect(provider)}>
                  Disconnect
                </Button>
              </Tooltip>
            ) : (
              <Button onClick={() => connect(provider)}>Connect</Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
