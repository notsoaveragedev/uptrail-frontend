import type { CheckResult } from "@/types/logs";
import { csvRow } from "./csv";

type ExportField = [header: string, read: (result: CheckResult) => string | number | null];

const FIELDS_BY_COLUMN: Record<string, ExportField[]> = {
  time: [["time", (result) => new Date(result.ts).toISOString()]],
  monitor: [
    ["monitor", (result) => result.monitorName],
    ["url", (result) => result.monitorUrl],
  ],
  region: [["region", (result) => result.region]],
  status: [["status", (result) => result.status]],
  code: [["status_code", (result) => result.statusCode]],
  latency: [["latency_ms", (result) => result.latencyMs]],
  timings: [
    ["dns_ms", (result) => result.timings.dns],
    ["connect_ms", (result) => result.timings.connect],
    ["tls_ms", (result) => result.timings.tls],
    ["ttfb_ms", (result) => result.timings.ttfb],
    ["download_ms", (result) => result.timings.download],
  ],
  size: [["size_bytes", (result) => result.sizeBytes]],
  error: [
    ["error_type", (result) => result.error?.type ?? null],
    ["error_message", (result) => result.error?.message ?? null],
  ],
  id: [["id", (result) => result.id]],
};

export const EXPORTABLE_COLUMNS = Object.keys(FIELDS_BY_COLUMN);

export function exportFields(columns: string[]) {
  return columns.flatMap((column) => FIELDS_BY_COLUMN[column] ?? []);
}

export function csvHeader(fields: ExportField[]) {
  return `${csvRow(fields.map(([header]) => header))}\n`;
}

export function csvRows(results: CheckResult[], fields: ExportField[]) {
  return results.map((result) => csvRow(fields.map(([, read]) => read(result)))).join("\n") + "\n";
}
