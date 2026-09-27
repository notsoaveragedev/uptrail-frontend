import type { ColumnState } from "@/types/dataGrid";

export type SavedView = {
  id: string;
  name: string;
  search: string;
  columnState?: ColumnState;
};

export const BUILT_IN_VIEWS: SavedView[] = [
  { id: "all", name: "All checks", search: "" },
  { id: "failures", name: "Failures last 24h", search: "range=24h&status=down" },
  { id: "slow", name: "Slow checks", search: "range=24h&status=degraded&sort=-latency" },
  { id: "bom", name: "BOM region", search: "region=BOM" },
];

export function viewSearch(params: URLSearchParams) {
  const copy = new URLSearchParams(params);
  copy.delete("check");
  copy.sort();
  return copy.toString();
}

export function normalizeSearch(search: string) {
  return viewSearch(new URLSearchParams(search));
}
