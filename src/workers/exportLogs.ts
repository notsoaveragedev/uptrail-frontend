import { csvHeader, csvRows, exportFields } from "@/lib/logsExport";
import { runLogsQuery } from "@/lib/logsQuery";
import { generateCheckResults } from "@/mocks/checkResults";
import type { LogsFilters } from "@/types/logs";

type ExportRequest = {
  filters: LogsFilters;
  anchor: number;
  columns: string[];
};

export type ExportMessage =
  { type: "chunk"; text: string; done: number; total: number } | { type: "done"; total: number };

const CHUNK_SIZE = 2_000;

const scope = self as unknown as {
  postMessage: (message: ExportMessage) => void;
  addEventListener: (type: "message", listener: (event: MessageEvent<ExportRequest>) => void) => void;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

scope.addEventListener("message", async (event) => {
  const { filters, anchor, columns } = event.data;
  const { matched } = runLogsQuery(generateCheckResults(anchor), filters, anchor);
  const fields = exportFields(columns);

  scope.postMessage({ type: "chunk", text: csvHeader(fields), done: 0, total: matched.length });
  for (let start = 0; start < matched.length; start += CHUNK_SIZE) {
    const rows = matched.slice(start, start + CHUNK_SIZE);
    scope.postMessage({
      type: "chunk",
      text: csvRows(rows, fields),
      done: start + rows.length,
      total: matched.length,
    });
    await wait(20);
  }
  scope.postMessage({ type: "done", total: matched.length });
});
