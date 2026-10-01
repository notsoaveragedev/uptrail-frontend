import { Button, Segmented } from "antd";
import { useState } from "react";
import { LuCopy } from "react-icons/lu";
import { useCopy } from "@/hooks/useCopy";
import { BADGE_FORMAT_OPTIONS, STATUS_ORIGIN } from "@/lib/statusPages";
import { statusBadgeDataUri, statusBadgeEmbeds, type BadgeEmbedFormat } from "@/lib/statusBadge";
import type { OverallStatus } from "@/types/statusPage";

type BadgeEmbedProps = {
  slug: string;
  title: string;
  status: OverallStatus;
};

export function BadgeEmbed({ slug, title, status }: BadgeEmbedProps) {
  const copy = useCopy();
  const [format, setFormat] = useState<BadgeEmbedFormat>("markdown");
  const code = statusBadgeEmbeds(slug, title, STATUS_ORIGIN)[format];

  return (
    <div className="flex w-80 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-md font-semibold">Status badge</span>
        <img src={statusBadgeDataUri("uptrail", status)} alt={`${title} status badge preview`} height={20} />
      </div>
      <Segmented<BadgeEmbedFormat>
        block
        size="small"
        value={format}
        onChange={setFormat}
        options={BADGE_FORMAT_OPTIONS}
      />
      <pre className="m-0 rounded-md border border-line bg-panel p-2.5 font-mono text-xs break-all whitespace-pre-wrap text-ink">
        {code}
      </pre>
      <Button
        type="primary"
        icon={<LuCopy />}
        onClick={() => copy(code, "Badge copied", "Paste it into your README or docs.")}
      >
        Copy {BADGE_FORMAT_OPTIONS.find((option) => option.value === format)?.label}
      </Button>
    </div>
  );
}
