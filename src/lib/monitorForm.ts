import type { IconType } from "react-icons";
import { LuBraces, LuGauge, LuGlobe, LuShieldCheck, LuTextSearch } from "react-icons/lu";
import { z } from "zod";
import type { HttpMethod, Monitor, MonitorType, RegionCode } from "@/types/monitor";
import { LATENCY_THRESHOLD_MS } from "./format";
import { DEFAULT_TIMEOUT_MS, formatInterval, HTTP_METHODS, MONITOR_TYPE_VALUES, projectLabel } from "./monitors";

export type HeaderRow = { id: string; key: string; value: string; isSecret: boolean };

type JsonOperator = "eq" | "neq" | "contains" | "gt" | "lt";

export type ChannelId = "email" | "slack" | "discord";

export type MonitorFormValues = {
  type: MonitorType;
  name: string;
  url: string;
  method: HttpMethod;
  headers: HeaderRow[];
  body: string;
  timeoutMs: string;
  followRedirects: boolean;
  expectedStatus: string;
  keyword: string;
  keywordMode: "present" | "absent";
  jsonPath: string;
  jsonOperator: JsonOperator;
  jsonValue: string;
  maxLatencyMs: string;
  sslWarnDays: string;
  intervalSec: number;
  regions: RegionCode[];
  project: string;
  tags: string[];
  createAlertRule: boolean;
  channels: ChannelId[];
};

export type FormErrors = Record<string, string>;

export type MonitorFieldProps = {
  values: MonitorFormValues;
  errors: FormErrors;
  onChange: (patch: Partial<MonitorFormValues>) => void;
};

export type StepKey = "type" | "request" | "assertions" | "schedule" | "alerts" | "review";

export const STEPS: { key: StepKey; label: string; description: string }[] = [
  { key: "type", label: "Type", description: "Choose what this monitor checks." },
  { key: "request", label: "Request", description: "The request Uptrail sends on every check." },
  { key: "assertions", label: "Assertions", description: "What a healthy response looks like." },
  { key: "schedule", label: "Schedule & regions", description: "How often and where checks run." },
  { key: "alerts", label: "Alerts", description: "Who hears about it when the monitor fails." },
  { key: "review", label: "Review", description: "Check everything before the first check runs." },
];

export const EDIT_TABS = STEPS.filter((step) => step.key !== "type" && step.key !== "review");

export const MONITOR_TYPES: { value: MonitorType; label: string; description: string; icon: IconType }[] = [
  { value: "http", label: "HTTP(S)", description: "The response status matches the codes you expect.", icon: LuGlobe },
  {
    value: "keyword",
    label: "Keyword",
    description: "A word is present, or absent, in the response body.",
    icon: LuTextSearch,
  },
  {
    value: "json",
    label: "JSON assertion",
    description: "A value at a JSON path matches what you expect.",
    icon: LuBraces,
  },
  {
    value: "ssl",
    label: "SSL certificate",
    description: "The certificate is valid and not about to expire.",
    icon: LuShieldCheck,
  },
  {
    value: "response_time",
    label: "Response time",
    description: "Responses stay under a latency threshold.",
    icon: LuGauge,
  },
];

export const JSON_OPERATORS: { value: JsonOperator; label: string; symbol: string }[] = [
  { value: "eq", label: "equals", symbol: "==" },
  { value: "neq", label: "does not equal", symbol: "!=" },
  { value: "contains", label: "contains", symbol: "contains" },
  { value: "gt", label: "is greater than", symbol: ">" },
  { value: "lt", label: "is less than", symbol: "<" },
];

export const INTERVALS = [30, 60, 300, 900, 1800, 3600];

export const CHANNELS: { id: ChannelId; label: string; detail: string }[] = [
  { id: "email", label: "Email to the team", detail: "4 members of Pixelcraft Studio" },
  { id: "slack", label: "#oncall", detail: "Slack · pixelcraft.slack.com" },
  { id: "discord", label: "Discord webhook", detail: "#status-alerts" },
];

export const MAX_TIMEOUT_MS = 30_000;

export function methodHasBody(method: HttpMethod) {
  return method === "POST" || method === "PUT" || method === "PATCH";
}

export function newHeaderRow(key = "", value = "", isSecret = false): HeaderRow {
  return { id: crypto.randomUUID(), key, value, isSecret };
}

export const DEFAULT_VALUES: MonitorFormValues = {
  type: "http",
  name: "",
  url: "",
  method: "GET",
  headers: [],
  body: "",
  timeoutMs: String(DEFAULT_TIMEOUT_MS),
  followRedirects: true,
  expectedStatus: "200-299",
  keyword: "",
  keywordMode: "present",
  jsonPath: "$.status",
  jsonOperator: "eq",
  jsonValue: "",
  maxLatencyMs: String(LATENCY_THRESHOLD_MS),
  sslWarnDays: "14",
  intervalSec: 60,
  regions: ["BOM", "FRA", "IAD"],
  project: "pixelcraft",
  tags: [],
  createAlertRule: true,
  channels: ["email", "slack"],
};

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function jsonError(text: string) {
  if (!text.trim()) return null;
  try {
    JSON.parse(text);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid JSON";
  }
}

const STATUS_CODES_PATTERN = /^\s*[1-5]\d\d(\s*-\s*[1-5]\d\d)?(\s*,\s*[1-5]\d\d(\s*-\s*[1-5]\d\d)?)*\s*$/;

function wholeNumber(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .regex(/^\d+$/, `Enter the ${label} as a whole number.`)
    .transform(Number)
    .pipe(
      z
        .number()
        .min(min, `The ${label} must be at least ${min.toLocaleString()}.`)
        .max(max, `The ${label} can be at most ${max.toLocaleString()}.`),
    );
}

const expectedStatus = z.string().regex(STATUS_CODES_PATTERN, "Use status codes or ranges, like 200-299, 301.");

const typeSchema = z.object({ type: z.enum(MONITOR_TYPE_VALUES) });

const requestSchema = z
  .object({
    name: z.string().trim().min(1, "Give the monitor a name.").max(80, "Keep the name under 80 characters."),
    url: z
      .string()
      .trim()
      .min(1, "Enter the URL to check.")
      .refine(isHttpUrl, "Enter a valid URL. It must start with http:// or https://"),
    method: z.enum(HTTP_METHODS),
    headers: z.array(
      z
        .object({ key: z.string(), value: z.string() })
        .refine((row) => row.key.trim() || !row.value.trim(), { message: "Add a header name.", path: ["key"] })
        .refine((row) => !/\s/.test(row.key.trim()), { message: "Header names can't contain spaces.", path: ["key"] }),
    ),
    body: z.string(),
    timeoutMs: wholeNumber("timeout", 100, MAX_TIMEOUT_MS),
  })
  .superRefine((values, context) => {
    const error = methodHasBody(values.method) ? jsonError(values.body) : null;
    if (error) context.addIssue({ code: "custom", path: ["body"], message: `The body isn't valid JSON: ${error}` });
  });

const ASSERTION_SCHEMAS: Record<MonitorType, z.ZodType> = {
  http: z.object({ expectedStatus }),
  keyword: z.object({
    expectedStatus,
    keyword: z.string().trim().min(1, "Enter the keyword to look for."),
  }),
  json: z.object({
    expectedStatus,
    jsonPath: z
      .string()
      .trim()
      .regex(/^\$(\.[A-Za-z_][\w-]*|\[\d+\])*$/, "Use a JSON path like $.status or $.items[0].id."),
    jsonValue: z.string().trim().min(1, "Enter the value to compare against."),
  }),
  response_time: z.object({ expectedStatus, maxLatencyMs: wholeNumber("threshold", 50, MAX_TIMEOUT_MS) }),
  ssl: z.object({ sslWarnDays: wholeNumber("warning window", 1, 90) }),
};

const scheduleSchema = z.object({
  intervalSec: z.number().refine((value) => INTERVALS.includes(value), "Choose a check interval."),
  regions: z.array(z.string()).min(1, "Pick at least one region."),
  project: z.string().min(1, "Choose a project."),
});

const alertsSchema = z
  .object({ createAlertRule: z.boolean(), channels: z.array(z.string()) })
  .refine((values) => !values.createAlertRule || values.channels.length > 0, {
    message: "Pick at least one channel for the alert rule.",
    path: ["channels"],
  });

function schemaFor(step: StepKey, type: MonitorType): z.ZodType | null {
  if (step === "type") return typeSchema;
  if (step === "request") return requestSchema;
  if (step === "assertions") return ASSERTION_SCHEMAS[type];
  if (step === "schedule") return scheduleSchema;
  if (step === "alerts") return alertsSchema;
  return null;
}

export function stepErrors(step: StepKey, values: MonitorFormValues): FormErrors {
  const result = schemaFor(step, values.type)?.safeParse(values);
  if (!result || result.success) return {};

  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    errors[issue.path.join(".")] ??= issue.message;
  }
  return errors;
}

export function withoutErrors(errors: FormErrors, fields: string[]) {
  return Object.fromEntries(
    Object.entries(errors).filter(([key]) => !fields.some((field) => key === field || key.startsWith(`${field}.`))),
  );
}

export function isSameForm(a: MonitorFormValues, b: MonitorFormValues) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function alertRuleFor(values: MonitorFormValues) {
  if (values.type === "ssl") return `ssl_days_remaining < ${values.sslWarnDays || 14}`;
  if (values.type === "response_time") return `latency_ms > ${values.maxLatencyMs || LATENCY_THRESHOLD_MS} for 5m`;
  return `status == "down" for 2m`;
}

export function monthlyChecks(values: MonitorFormValues) {
  return Math.round((30 * 24 * 3600) / values.intervalSec) * values.regions.length;
}

type ReviewRow = { label: string; value: string; isMono?: boolean };
type ReviewSection = { step: StepKey; title: string; rows: ReviewRow[] };

function headersSummary(headers: HeaderRow[]) {
  const filled = headers.filter((row) => row.key.trim());
  if (filled.length === 0) return "None";
  return filled.map((row) => `${row.key}: ${row.isSecret ? "••••••" : row.value}`).join("\n");
}

function assertionRows(values: MonitorFormValues): ReviewRow[] {
  const status = { label: "Expected status", value: values.expectedStatus, isMono: true };
  if (values.type === "keyword") {
    return [status, { label: "Keyword", value: `"${values.keyword}" must be ${values.keywordMode}` }];
  }
  if (values.type === "json") {
    const operator = JSON_OPERATORS.find((option) => option.value === values.jsonOperator)?.symbol;
    return [
      status,
      { label: "JSON assertion", value: `${values.jsonPath} ${operator} ${values.jsonValue}`, isMono: true },
    ];
  }
  if (values.type === "response_time")
    return [status, { label: "Max latency", value: `${values.maxLatencyMs} ms`, isMono: true }];
  if (values.type === "ssl")
    return [{ label: "Warn before expiry", value: `${values.sslWarnDays} days`, isMono: true }];
  return [status];
}

function channelLabels(channels: ChannelId[]) {
  return CHANNELS.filter((channel) => channels.includes(channel.id))
    .map((channel) => channel.label)
    .join(", ");
}

export function reviewSections(values: MonitorFormValues): ReviewSection[] {
  const typeLabel = MONITOR_TYPES.find((option) => option.value === values.type)?.label ?? values.type;
  const hasBody = methodHasBody(values.method) && values.body.trim();

  return [
    { step: "type", title: "Type", rows: [{ label: "Monitor type", value: typeLabel }] },
    {
      step: "request",
      title: "Request",
      rows: [
        { label: "Name", value: values.name },
        { label: "Request", value: `${values.method} ${values.url}`, isMono: true },
        { label: "Headers", value: headersSummary(values.headers), isMono: true },
        ...(hasBody ? [{ label: "Body", value: `${values.body.trim().length} characters of JSON` }] : []),
        { label: "Timeout", value: `${Number(values.timeoutMs).toLocaleString()} ms`, isMono: true },
        { label: "Follow redirects", value: values.followRedirects ? "Yes, up to 5 hops" : "No" },
      ],
    },
    { step: "assertions", title: "Assertions", rows: assertionRows(values) },
    {
      step: "schedule",
      title: "Schedule & regions",
      rows: [
        { label: "Interval", value: `Every ${formatInterval(values.intervalSec)}` },
        { label: "Regions", value: values.regions.join(", "), isMono: true },
        { label: "Project", value: projectLabel(values.project) },
        { label: "Tags", value: values.tags.length ? values.tags.join(", ") : "None" },
      ],
    },
    {
      step: "alerts",
      title: "Alerts",
      rows: values.createAlertRule
        ? [
            { label: "Alert rule", value: alertRuleFor(values), isMono: true },
            { label: "Channels", value: channelLabels(values.channels) },
          ]
        : [{ label: "Alert rule", value: "None" }],
    },
  ];
}

export type FieldChange = { label: string; before: string; after: string };

export function changedFields(before: MonitorFormValues, after: MonitorFormValues): FieldChange[] {
  const beforeRows = new Map(
    reviewSections(before).flatMap((section) => section.rows.map((row) => [row.label, row.value])),
  );
  const afterRows = reviewSections(after).flatMap((section) => section.rows);
  const labels = new Set([...beforeRows.keys(), ...afterRows.map((row) => row.label)]);

  return [...labels]
    .map((label) => ({
      label,
      before: beforeRows.get(label) ?? "None",
      after: afterRows.find((row) => row.label === label)?.value ?? "None",
    }))
    .filter((change) => change.before !== change.after);
}

const SAMPLE_BODY = JSON.stringify(
  { cart_id: "c_9f2a71", currency: "INR", items: [{ sku: "SN-TEE-042", qty: 1 }], dry_run: true },
  null,
  2,
);

export function configFromMonitor(monitor: Monitor): MonitorFormValues {
  const hasBody = methodHasBody(monitor.method);
  return {
    ...DEFAULT_VALUES,
    type: monitor.type,
    name: monitor.name,
    url: monitor.url,
    method: monitor.method,
    headers: hasBody
      ? [
          newHeaderRow("Authorization", "Bearer sk_live_51Hc9x2uEw7Q", true),
          newHeaderRow("Content-Type", "application/json"),
        ]
      : [newHeaderRow("User-Agent", "Uptrail/1.0 (+https://uptrail.dev/bot)")],
    body: hasBody ? SAMPLE_BODY : "",
    keyword: monitor.type === "keyword" ? "Get started" : "",
    jsonValue: monitor.type === "json" ? '"ok"' : "",
    intervalSec: monitor.intervalSec,
    regions: monitor.regions.map((region) => region.code),
    project: monitor.project,
    tags: monitor.tags,
  };
}
