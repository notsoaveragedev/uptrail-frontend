import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { LuBellOff, LuCircleCheck, LuLink2Off } from "react-icons/lu";
import { useParams, useSearchParams } from "react-router";
import { confirmSubscription, unsubscribe } from "@/api/publicStatus";
import { BrandMark } from "@/components/public-status/BrandMark";
import { PendingNotice } from "@/components/public-status/PendingNotice";
import { PublicNotice } from "@/components/public-status/PublicNotice";
import { PublicShell } from "@/components/public-status/PublicShell";
import { StatusLink } from "@/components/public-status/StatusLink";
import { useStatusSnapshot } from "@/components/public-status/useStatusSnapshot";
import { paths } from "@/lib/paths";

export function UnsubscribePage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { data: status } = useStatusSnapshot(slug);
  const { data: isUnsubscribed } = useQuery({
    queryKey: ["public-status", slug, "unsubscribe", token],
    queryFn: () => unsubscribe(token),
    staleTime: Infinity,
    retry: false,
  });
  const undo = useMutation({ mutationFn: () => confirmSubscription(token) });
  const title = status?.snapshot.title ?? slug;
  const backLink = <StatusLink to={paths.publicStatus(slug)}>Back to {title} status</StatusLink>;

  return (
    <PublicShell theme={status?.snapshot.theme}>
      <title>{`Unsubscribe · ${title} status`}</title>
      <BrandMark title={title} logoUrl={status?.snapshot.logoUrl ?? null} />
      {isUnsubscribed === undefined && <PendingNotice label="Unsubscribing…" />}
      {isUnsubscribed === false && (
        <PublicNotice tone="down" icon={<LuLink2Off />} title="This unsubscribe link isn't valid" actions={backLink}>
          Use the unsubscribe link at the bottom of any {title} status email.
        </PublicNotice>
      )}
      {isUnsubscribed && undo.isSuccess && (
        <PublicNotice
          tone="up"
          icon={<LuCircleCheck />}
          title={`You're subscribed to ${title} again`}
          actions={backLink}
        >
          You'll keep getting emails about {title} incidents.
        </PublicNotice>
      )}
      {isUnsubscribed && !undo.isSuccess && (
        <PublicNotice
          tone="paused"
          icon={<LuBellOff />}
          title={`Unsubscribed from ${title}`}
          actions={
            <>
              <Button loading={undo.isPending} onClick={() => undo.mutate()}>
                Undo
              </Button>
              {backLink}
            </>
          }
        >
          You won't get any more emails about {title} incidents.
        </PublicNotice>
      )}
    </PublicShell>
  );
}
