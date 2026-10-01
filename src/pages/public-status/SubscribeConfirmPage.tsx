import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import type { ReactNode } from "react";
import { LuCircleCheck, LuClock, LuLink2Off, LuMailCheck } from "react-icons/lu";
import { useParams, useSearchParams } from "react-router";
import { confirmSubscription } from "@/api/publicStatus";
import { BrandMark } from "@/components/public-status/BrandMark";
import { PendingNotice } from "@/components/public-status/PendingNotice";
import { PublicNotice } from "@/components/public-status/PublicNotice";
import { PublicShell } from "@/components/public-status/PublicShell";
import { StatusLink } from "@/components/public-status/StatusLink";
import { useStatusSnapshot } from "@/components/public-status/useStatusSnapshot";
import { fakeRequest } from "@/lib/fakeRequest";
import { paths } from "@/lib/paths";

export function SubscribeConfirmPage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { data: status } = useStatusSnapshot(slug);
  const { data: result } = useQuery({
    queryKey: ["public-status", slug, "confirm", token],
    queryFn: () => confirmSubscription(token),
    staleTime: Infinity,
    retry: false,
  });
  const title = status?.snapshot.title ?? slug;
  const backLink = <StatusLink to={paths.publicStatus(slug)}>Back to {title} status</StatusLink>;

  return (
    <PublicShell theme={status?.snapshot.theme}>
      <title>{`Confirm subscription · ${title} status`}</title>
      <BrandMark title={title} logoUrl={status?.snapshot.logoUrl ?? null} />
      {!result && <PendingNotice label="Confirming your subscription…" />}
      {result?.ok && (
        <PublicNotice
          tone="up"
          icon={<LuCircleCheck />}
          title={`You're subscribed to ${title} status`}
          actions={backLink}
        >
          We'll email you when an incident is created, updated or resolved. Every email has a one-click unsubscribe
          link.
        </PublicNotice>
      )}
      {result?.ok === false && result.reason === "expired" && <ExpiredNotice backLink={backLink} />}
      {result?.ok === false && result.reason === "invalid" && (
        <PublicNotice tone="down" icon={<LuLink2Off />} title="This confirmation link isn't valid" actions={backLink}>
          It may have been copied incorrectly or already used. Subscribe again from the status page to get a new link.
        </PublicNotice>
      )}
    </PublicShell>
  );
}

function ExpiredNotice({ backLink }: { backLink: ReactNode }) {
  const resend = useMutation({ mutationFn: () => fakeRequest(600) });

  if (resend.isSuccess) {
    return (
      <PublicNotice tone="up" icon={<LuMailCheck />} title="Check your inbox" actions={backLink}>
        We sent you a fresh confirmation link. It's valid for 24 hours.
      </PublicNotice>
    );
  }

  return (
    <PublicNotice
      tone="degraded"
      icon={<LuClock />}
      title="This confirmation link has expired"
      actions={
        <>
          <Button type="primary" loading={resend.isPending} onClick={() => resend.mutate()}>
            Resend link
          </Button>
          {backLink}
        </>
      }
    >
      Confirmation links are valid for 24 hours. We can send you a new one.
    </PublicNotice>
  );
}
