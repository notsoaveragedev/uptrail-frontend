import { z } from "zod";
import { MONITOR_TYPE_LABELS, REGIONS } from "@/lib/monitors";
import { projects } from "@/mocks/workspace";
import type { HttpMethod, Monitor, MonitorType, RegionCode } from "@/types/monitor";

export const MAX_IMPORT_BYTES = 1024 * 1024;

export type ImportField =
  "name" | "url" | "type" | "method" | "interval" | "regions" | "project" | "tags" | "expected_status";

export type ImportFieldInfo = {
  key: ImportField;
  label: string;
  isRequired: boolean;
  example: string;
  aliases: string[];
};

export const IMPORT_FIELDS: ImportFieldInfo[] = [
  { key: "name", label: "Name", isRequired: true, example: "Checkout API", aliases: ["monitor", "title"] },
  {
    key: "url",
    label: "URL",
    isRequired: true,
    example: "https://api.shopnest.in/v2/checkout",
    aliases: ["endpoint", "target", "address"],
  },
  { key: "type", label: "Type", isRequired: false, example: "http", aliases: ["kind", "monitortype", "checktype"] },
  { key: "method", label: "Method", isRequired: false, example: "GET", aliases: ["httpmethod", "verb"] },
  {
    key: "interval",
    label: "Interval",
    isRequired: false,
    example: "1m",
    aliases: ["intervalsec", "frequency", "every", "checkinterval"],
  },
  {
    key: "regions",
    label: "Regions",
    isRequired: false,
    example: "BOM;FRA;IAD",
    aliases: ["region", "locations", "location"],
  },
  { key: "project", label: "Project", isRequired: false, example: "shopnest", aliases: ["projectname", "group"] },
  { key: "tags", label: "Tags", isRequired: false, example: "production;api", aliases: ["tag", "labels", "label"] },
  {
    key: "expected_status",
    label: "Expected status",
    isRequired: false,
    example: "200-299",
    aliases: ["expectedstatus", "status", "statuscodes", "expectedcodes"],
  },
];

export type ImportValues = Record<ImportField, string>;

export type ImportRow = {
  id: string;
  line: number;
  values: ImportValues;
};

export type RowErrors = Partial<Record<ImportField, string>>;

export type ColumnMapping = Record<ImportField, string | null>;

export type ParsedFile = {
  fileName: string;
  format: "csv" | "json";
  headers: string[];
  records: Record<string, string>[];
};

const MONITOR_TYPES: MonitorType[] = ["http", "keyword", "json", "ssl", "response_time"];
const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];
const REGION_CODES = REGIONS.map((region) => region.code);
const PROJECT_OPTIONS = projects.filter((project) => project.value !== "all");
const DEFAULT_REGIONS: RegionCode[] = ["BOM", "FRA", "IAD"];
const TYPE_ALIASES: Record<string, MonitorType> = {
  https: "http",
  json_assert: "json",
  json_assertion: "json",
  "response-time": "response_time",
  responsetime: "response_time",
  latency: "response_time",
};

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let isQuoted = false;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];

    if (isQuoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        isQuoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      isQuoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (isQuoted) throw new Error("The CSV has an unclosed quote.");
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim()));
}

function csvToFile(fileName: string, text: string): ParsedFile {
  const [headerRow, ...dataRows] = parseCsv(text.replace(/^\uFEFF/, ""));
  if (!headerRow) throw new Error("The file is empty.");

  const headers = headerRow.map((header) => header.trim());
  if (new Set(headers).size !== headers.length) throw new Error("The CSV has duplicate column names.");

  const records = dataRows.map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, (cells[index] ?? "").trim()])),
  );
  return { fileName, format: "csv", headers, records };
}

function toCellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(toCellText).join(";");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).trim();
}

function jsonToFile(fileName: string, text: string): ParsedFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("The file isn't valid JSON.");
  }

  const items = Array.isArray(data) ? data : (data as { monitors?: unknown })?.monitors;
  if (!Array.isArray(items)) throw new Error("The JSON must be an array of monitor objects.");
  if (!items.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
    throw new Error("Every item in the JSON array must be an object.");
  }

  const objects = items as Record<string, unknown>[];
  const headers = [...new Set(objects.flatMap((item) => Object.keys(item)))];
  const records = objects.map((item) =>
    Object.fromEntries(headers.map((header) => [header, toCellText(item[header])])),
  );
  return { fileName, format: "json", headers, records };
}

export function checkImportFile(file: { name: string; size: number }) {
  if (!/\.(csv|json)$/i.test(file.name)) return "Only .csv and .json files are supported.";
  if (file.size > MAX_IMPORT_BYTES) return "The file is larger than 1 MB. Split it into smaller files.";
  return null;
}

export function parseImportFile(fileName: string, text: string) {
  const parsed = /\.json$/i.test(fileName) ? jsonToFile(fileName, text) : csvToFile(fileName, text);
  if (parsed.records.length === 0) throw new Error("The file has no monitor rows.");
  return parsed;
}

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function autoMapColumns(headers: string[]): ColumnMapping {
  const findHeader = (field: ImportFieldInfo) =>
    headers.find((header) => [field.key, ...field.aliases].map(normalizeKey).includes(normalizeKey(header))) ?? null;

  return Object.fromEntries(IMPORT_FIELDS.map((field) => [field.key, findHeader(field)])) as ColumnMapping;
}

export function missingRequiredFields(mapping: ColumnMapping) {
  return IMPORT_FIELDS.filter((field) => field.isRequired && !mapping[field.key]);
}

export function buildRows(file: ParsedFile, mapping: ColumnMapping): ImportRow[] {
  return file.records.map((record, index) => ({
    id: `row-${index}`,
    line: file.format === "csv" ? index + 2 : index + 1,
    values: Object.fromEntries(
      IMPORT_FIELDS.map((field) => {
        const header = mapping[field.key];
        return [field.key, header ? (record[header] ?? "") : ""];
      }),
    ) as ImportValues,
  }));
}

function splitList(value: string) {
  return value
    .split(/[;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseType(value: string) {
  const key = value.trim().toLowerCase();
  if (!key) return "http";
  return TYPE_ALIASES[key] ?? MONITOR_TYPES.find((type) => type === key) ?? null;
}

function parseMethod(value: string) {
  const key = value.trim().toUpperCase();
  if (!key) return "GET";
  return HTTP_METHODS.find((method) => method === key) ?? null;
}

export function parseInterval(value: string) {
  if (!value.trim()) return 60;
  const match = /^(\d+)\s*(s|m|h)?$/i.exec(value.trim());
  if (!match) return null;
  const unit = { s: 1, m: 60, h: 3600 }[(match[2] ?? "s").toLowerCase() as "s" | "m" | "h"];
  return Number(match[1]) * unit;
}

function parseRegions(value: string) {
  const codes = splitList(value.toUpperCase());
  return codes.length ? codes : DEFAULT_REGIONS;
}

function findProject(value: string) {
  const key = value.trim().toLowerCase();
  if (!key) return PROJECT_OPTIONS[0];
  return PROJECT_OPTIONS.find((project) => project.value === key || project.label.toLowerCase() === key) ?? null;
}

function parseTags(value: string) {
  return [...new Set(splitList(value.toLowerCase()))];
}

function isStatusCode(value: string) {
  const code = Number(value);
  return /^\d{3}$/.test(value) && code >= 100 && code <= 599;
}

function isExpectedStatus(value: string) {
  return splitList(value.replace(/,/g, ";")).every((part) => {
    const [from, to, ...rest] = part.split("-").map((item) => item.trim());
    if (rest.length) return false;
    if (to === undefined) return isStatusCode(from);
    return isStatusCode(from) && isStatusCode(to) && Number(from) <= Number(to);
  });
}

const FIELD_SCHEMAS: Record<ImportField, z.ZodType<string>> = {
  name: z.string().trim().min(1, "Name is required").max(80, "Name must be 80 characters or fewer"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .refine((value) => z.url({ protocol: /^https?$/, hostname: z.regexes.domain }).safeParse(value).success, {
      message: "URL must start with http:// or https://",
    }),
  type: z.string().refine((value) => parseType(value) !== null, {
    message: `Type must be one of ${MONITOR_TYPES.join(", ")}`,
  }),
  method: z.string().refine((value) => parseMethod(value) !== null, {
    message: `Method must be one of ${HTTP_METHODS.join(", ")}`,
  }),
  interval: z
    .string()
    .refine((value) => parseInterval(value) !== null, { message: 'Use seconds or a unit, like "30s", "5m" or "300"' })
    .refine(
      (value) => {
        const seconds = parseInterval(value);
        return seconds === null || (seconds >= 30 && seconds <= 3600);
      },
      { message: "Interval must be between 30s and 1h" },
    ),
  regions: z
    .string()
    .refine((value) => parseRegions(value).every((code) => REGION_CODES.some((known) => known === code)), {
      message: `Regions must be from ${REGION_CODES.join(", ")}`,
    }),
  project: z.string().refine((value) => findProject(value) !== null, {
    message: `Project must be one of ${PROJECT_OPTIONS.map((project) => project.value).join(", ")}`,
  }),
  tags: z.string().refine((value) => parseTags(value).every((tag) => /^[a-z0-9][a-z0-9-]{0,31}$/.test(tag)), {
    message: "Tags use lowercase letters, numbers and dashes",
  }),
  expected_status: z.string().refine((value) => !value.trim() || isExpectedStatus(value), {
    message: 'Use status codes or ranges, like "200" or "200-299"',
  }),
};

export function validateValues(values: ImportValues) {
  const errors: RowErrors = {};
  for (const field of IMPORT_FIELDS) {
    const result = FIELD_SCHEMAS[field.key].safeParse(values[field.key]);
    if (!result.success) errors[field.key] = result.error.issues[0]?.message;
  }
  return errors;
}

function duplicateKey(url: string, type: MonitorType) {
  return `${type} ${url.trim().toLowerCase().replace(/\/+$/, "")}`;
}

export function validateRows(rows: ImportRow[], existing: Pick<Monitor, "url" | "type">[]) {
  const existingKeys = new Set(existing.map((monitor) => duplicateKey(monitor.url, monitor.type)));
  const firstLineByKey = new Map<string, number>();
  const errorsById = new Map<string, RowErrors>();

  for (const row of rows) {
    const errors = validateValues(row.values);
    const type = parseType(row.values.type) ?? "http";
    const key = duplicateKey(row.values.url, type);

    if (!errors.url && existingKeys.has(key)) {
      errors.url = `A ${MONITOR_TYPE_LABELS[type]} monitor for this URL already exists`;
    } else if (!errors.url && firstLineByKey.has(key)) {
      errors.url = `Duplicate of row ${firstLineByKey.get(key)} in this file`;
    }
    if (!errors.url && !firstLineByKey.has(key)) firstLineByKey.set(key, row.line);

    errorsById.set(row.id, errors);
  }

  return errorsById;
}

export function hasErrors(errors: RowErrors | undefined) {
  return Boolean(errors && Object.keys(errors).length);
}

export function toMonitor(values: ImportValues): Monitor {
  const status = "up" as const;
  return {
    id: `mon_${crypto.randomUUID().slice(0, 8)}`,
    name: values.name.trim(),
    url: values.url.trim(),
    type: parseType(values.type) ?? "http",
    method: parseMethod(values.method) ?? "GET",
    intervalSec: parseInterval(values.interval) ?? 60,
    project: findProject(values.project)?.value ?? PROJECT_OPTIONS[0].value,
    tags: parseTags(values.tags),
    status,
    statusSince: Date.now(),
    latencyMs: null,
    uptime24h: null,
    uptime30d: null,
    regions: (parseRegions(values.regions) as RegionCode[]).map((code) => ({ code, status })),
    checks: [],
    latencyHistory: [],
    lastCheckedAt: null,
  };
}
