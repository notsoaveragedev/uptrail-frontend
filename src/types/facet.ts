import type { ReactNode } from "react";

export type FacetOption = {
  value: string;
  label: ReactNode;
  count?: number;
  searchText?: string;
};
