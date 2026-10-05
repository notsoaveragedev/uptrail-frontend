import { Button } from "antd";
import { useState } from "react";
import { LuCopy, LuServerCrash } from "react-icons/lu";
import { useNavigate } from "react-router";
import { StatusScreen } from "@/components/errors/StatusScreen";
import { useCopy } from "@/hooks/useCopy";
import { formatUtc } from "@/lib/format";
import { newId } from "@/lib/ids";
import { DEFAULT_APP_PATH } from "@/lib/safeRedirect";

export function ServerErrorPage({ isFullPage = true, details }: { isFullPage?: boolean; details?: string }) {
  const navigate = useNavigate();
  const copy = useCopy();
  const [reference] = useState(() => newId("err"));
  const [occurredAt] = useState(() => formatUtc(Date.now()));

  return (
    <StatusScreen
      isFullPage={isFullPage}
      icon={<LuServerCrash />}
      eyebrow="500"
      title="Something went wrong on our end"
      description="We've logged the error. Try again in a moment. If it keeps happening, send us the reference below."
      actions={
        <>
          <Button type="primary" onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Button onClick={() => navigate(DEFAULT_APP_PATH)}>Go to overview</Button>
        </>
      }
      details={details}
    >
      <div className="mt-8 flex items-center gap-3 rounded-md border border-line bg-panel py-1.5 pr-1.5 pl-3 font-mono text-xs whitespace-nowrap text-muted">
        <span>
          <span className="text-subtle">ref </span>
          <span className="text-ink">{reference}</span>
        </span>
        <span aria-hidden className="h-3 w-px bg-line" />
        <span>{occurredAt}</span>
        <Button
          size="small"
          type="text"
          aria-label="Copy error reference"
          icon={<LuCopy />}
          onClick={() => copy(`${reference} · ${occurredAt}`, "Error reference copied")}
        />
      </div>
    </StatusScreen>
  );
}
