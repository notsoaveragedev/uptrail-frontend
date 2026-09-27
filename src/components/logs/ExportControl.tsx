import { Button, Popover, Progress, Radio } from "antd";
import { useState } from "react";
import { LuDownload, LuX } from "react-icons/lu";
import { useLogExport } from "@/hooks/useLogExport";
import { EXPORTABLE_COLUMNS } from "@/lib/logsExport";
import type { LogsFilters } from "@/types/logs";

type ExportControlProps = {
  filters: LogsFilters;
  total: number;
  visibleColumns: string[];
};

export function ExportControl({ filters, total, visibleColumns }: ExportControlProps) {
  const { progress, start, cancel } = useLogExport();
  const [scope, setScope] = useState<"visible" | "all">("visible");
  const [isOpen, setIsOpen] = useState(false);

  if (progress) {
    const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
      <div role="status" className="flex h-8 items-center gap-3 rounded-md border border-line bg-card pr-1 pl-3">
        <span className="font-mono text-xs text-muted">
          {progress.done.toLocaleString()} / {progress.total.toLocaleString()}
        </span>
        <Progress percent={percent} size={[80, 4]} showInfo={false} strokeColor="var(--muted)" />
        <Button size="small" type="text" icon={<LuX />} onClick={cancel} aria-label="Cancel export" />
      </div>
    );
  }

  function exportNow() {
    setIsOpen(false);
    start(
      filters,
      scope === "all" ? EXPORTABLE_COLUMNS : visibleColumns.filter((key) => EXPORTABLE_COLUMNS.includes(key)),
    );
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger="click"
      placement="bottomRight"
      content={
        <div className="flex w-64 flex-col gap-3">
          <p className="font-medium">Export {total.toLocaleString()} rows as CSV</p>
          <Radio.Group
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className="flex flex-col gap-1.5"
          >
            <Radio value="visible">Visible columns only</Radio>
            <Radio value="all">All columns</Radio>
          </Radio.Group>
          <p className="text-xs text-subtle">Generated in the background, so you can keep working.</p>
          <Button type="primary" block onClick={exportNow} disabled={total === 0}>
            Export CSV
          </Button>
        </div>
      }
    >
      <Button icon={<LuDownload />}>Export</Button>
    </Popover>
  );
}
