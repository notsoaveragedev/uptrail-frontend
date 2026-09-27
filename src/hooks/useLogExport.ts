import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { downloadBlob } from "@/lib/download";
import { formatBytes } from "@/lib/format";
import { LOGS_ANCHOR } from "@/mocks/logsServer";
import type { LogsFilters } from "@/types/logs";
import type { ExportMessage } from "@/workers/exportLogs";

type Progress = { done: number; total: number };

export function useLogExport() {
  const toast = useToast();
  const workerRef = useRef<Worker | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => () => workerRef.current?.terminate(), []);

  function stop() {
    workerRef.current?.terminate();
    workerRef.current = null;
    setProgress(null);
  }

  function start(filters: LogsFilters, columns: string[]) {
    const worker = new Worker(new URL("../workers/exportLogs.ts", import.meta.url), { type: "module" });
    const parts: string[] = [];
    workerRef.current = worker;
    setProgress({ done: 0, total: 0 });

    worker.onmessage = (event: MessageEvent<ExportMessage>) => {
      const message = event.data;
      if (message.type === "chunk") {
        parts.push(message.text);
        setProgress({ done: message.done, total: message.total });
        return;
      }
      stop();
      const blob = new Blob(parts, { type: "text/csv" });
      const fileName = `uptrail-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadBlob(blob, fileName);
      toast.success(
        "Export ready",
        `${fileName} · ${message.total.toLocaleString()} rows · ${formatBytes(blob.size)}`,
        {
          label: "Download again",
          onClick: () => downloadBlob(blob, fileName),
        },
      );
    };
    worker.onerror = () => {
      stop();
      toast.error("Export failed", "The CSV couldn't be generated. Try again.");
    };
    worker.postMessage({ filters, anchor: LOGS_ANCHOR, columns });
  }

  function cancel() {
    stop();
    toast.info("Export cancelled");
  }

  return { progress, start, cancel };
}
