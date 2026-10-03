export function offsetLabel(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" }).formatToParts(new Date());
  return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
}

let options: { value: string; label: string }[] | null = null;

export function timezoneOptions() {
  options ??= Intl.supportedValuesOf("timeZone").map((zone) => ({
    value: zone,
    label: `${zone.replaceAll("_", " ")} · ${offsetLabel(zone)}`,
  }));
  return options;
}

export function localTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatInZone(timestamp: number, timeZone: string, withDate = false) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    ...(withDate ? { weekday: "short", month: "short", day: "numeric" } : {}),
  }).format(timestamp);
}
