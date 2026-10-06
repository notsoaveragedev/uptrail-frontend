import { Button, Tabs, Tooltip } from "antd";
import { useState } from "react";
import { LuCopy } from "react-icons/lu";
import { JsonCode } from "@/components/ui/JsonCode";
import { useCopy } from "@/hooks/useCopy";
import { CURL_SAMPLE, PUBLIC_ORIGIN, SHOWCASE_SLUG, WEBHOOK_SAMPLE } from "@/lib/landing";
import { statusBadgeDataUri, statusBadgeEmbeds } from "@/lib/statusBadge";

const BADGE_MARKDOWN = statusBadgeEmbeds(SHOWCASE_SLUG, "Shopnest", PUBLIC_ORIGIN).markdown;

const SAMPLES = {
  curl: { label: "cURL", code: CURL_SAMPLE },
  webhook: { label: "Webhook payload", code: WEBHOOK_SAMPLE },
  badge: { label: "README badge", code: BADGE_MARKDOWN },
};

type SampleKey = keyof typeof SAMPLES;

export function CodePanel() {
  const [active, setActive] = useState<SampleKey>("curl");
  const copy = useCopy();

  return (
    <div className="min-w-0 rounded-xl border border-line bg-card">
      <Tabs
        size="small"
        activeKey={active}
        onChange={(key) => setActive(key as SampleKey)}
        tabBarExtraContent={
          <Tooltip title="Copy">
            <Button
              type="text"
              aria-label={`Copy ${SAMPLES[active].label}`}
              icon={<LuCopy className="size-3.5" />}
              onClick={() => copy(SAMPLES[active].code, "Copied to clipboard")}
            />
          </Tooltip>
        }
        className="px-4 [&_.ant-tabs-nav]:mb-0"
        items={[
          { key: "curl", label: SAMPLES.curl.label, children: <PlainCode code={CURL_SAMPLE} /> },
          {
            key: "webhook",
            label: SAMPLES.webhook.label,
            children: <JsonCode code={WEBHOOK_SAMPLE} className="py-5 leading-5" />,
          },
          { key: "badge", label: SAMPLES.badge.label, children: <BadgeSample /> },
        ]}
      />
    </div>
  );
}

function PlainCode({ code }: { code: string }) {
  return <pre className="m-0 overflow-x-auto py-5 font-mono text-xs leading-5 text-ink">{code}</pre>;
}

function BadgeSample() {
  return (
    <div className="flex flex-col gap-4 py-5">
      <img
        src={statusBadgeDataUri("Shopnest", "operational")}
        alt="Shopnest status: operational"
        className="h-5 self-start"
      />
      <PlainCode code={BADGE_MARKDOWN} />
    </div>
  );
}
