import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Alert, Button, Drawer, Skeleton } from "antd";
import { useParams } from "react-router";
import { logDetailQuery } from "@/api/logs";
import { useWindowKeydown } from "@/hooks/useWindowKeydown";
import { isTypingTarget } from "@/lib/dom";
import type { CheckResultDetail } from "@/types/logs";
import { AssertionList } from "./drawer/AssertionList";
import { DetailHeader } from "./drawer/DetailHeader";
import { ErrorBlock } from "./drawer/ErrorBlock";
import { HeaderList } from "./drawer/HeaderList";
import { TimingWaterfall } from "./drawer/TimingWaterfall";

type LogDetailsDrawerProps = {
  resultId: string | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

const DRAWER_CLASS = "log-details-drawer";

function DetailBody({ detail }: { detail: CheckResultDetail }) {
  return (
    <>
      {detail.error && <ErrorBlock error={detail.error} />}
      <TimingWaterfall timings={detail.timings} />
      <AssertionList assertions={detail.assertions} />
      <HeaderList title="Request headers" headers={detail.requestHeaders} />
      <HeaderList title="Response headers" headers={detail.responseHeaders} />
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-5 py-4">
      <Skeleton active title={false} paragraph={{ rows: 5 }} />
      <Skeleton active title={false} paragraph={{ rows: 3 }} />
    </div>
  );
}

export function LogDetailsDrawer({ resultId, onClose, onPrev, onNext }: LogDetailsDrawerProps) {
  const { orgSlug = "" } = useParams();
  const query = useQuery({
    ...logDetailQuery(orgSlug, resultId ?? ""),
    enabled: resultId !== null,
    placeholderData: keepPreviousData,
    throwOnError: false,
  });
  const detail = query.data;

  const isOpen = resultId !== null;

  useWindowKeydown((event) => {
    const target = event.target as HTMLElement;
    if (!isOpen || !target.closest(`.${DRAWER_CLASS}`) || isTypingTarget(target)) return;
    const move = event.key === "ArrowUp" ? onPrev : event.key === "ArrowDown" ? onNext : undefined;
    if (!move) return;
    event.preventDefault();
    move();
  });

  return (
    <Drawer
      open={isOpen}
      rootClassName={DRAWER_CLASS}
      onClose={onClose}
      placement="right"
      size="30rem"
      mask={false}
      closable={false}
      title={null}
      focusable={{ trap: false, focusTriggerAfterClose: false }}
      aria-labelledby="log-detail-title"
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex h-full flex-col">
        <DetailHeader detail={detail} orgSlug={orgSlug} onClose={onClose} onPrev={onPrev} onNext={onNext} />
        <div
          className={`min-h-0 flex-1 overflow-y-auto transition-opacity ${query.isPlaceholderData ? "opacity-60" : ""}`}
        >
          {query.isError ? (
            <div className="p-5">
              <Alert
                type="error"
                showIcon
                title="Couldn't load this check"
                action={
                  <Button size="small" onClick={() => query.refetch()}>
                    Retry
                  </Button>
                }
              />
            </div>
          ) : detail ? (
            <DetailBody detail={detail} />
          ) : (
            <DetailSkeleton />
          )}
        </div>
      </div>
    </Drawer>
  );
}
