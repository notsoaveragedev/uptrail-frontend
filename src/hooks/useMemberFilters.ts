import { MEMBER_FILTER_KEYS, MEMBER_TABS, readMemberFilters, type MemberTab } from "@/lib/members";
import { readEnum } from "@/lib/searchParams";
import { useFilterParams } from "./useFilterParams";

export function useMemberFilters() {
  const { searchParams, setParam, ...rest } = useFilterParams(MEMBER_FILTER_KEYS, readMemberFilters);

  return {
    ...rest,
    tab: readEnum(searchParams, "tab", MEMBER_TABS, "members"),
    setTab: (tab: MemberTab) => setParam("tab", tab, "members"),
    setParam,
  };
}
