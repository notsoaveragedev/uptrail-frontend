import { Button } from "antd";
import { LuPanelLeftClose, LuPanelLeftOpen, LuRefreshCw } from "react-icons/lu";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useLogsFilters } from "@/hooks/useLogsFilters";
import { GROUP_BY_LABELS } from "@/lib/logs";
import type { ColumnState } from "@/types/dataGrid";
import type { LogsGroupBy } from "@/types/logs";
import { ColumnsMenu } from "./ColumnsMenu";
import { LogsTimeRange } from "./LogsTimeRange";

type LogsToolbarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  columnState: ColumnState;
  onColumnStateChange: (state: ColumnState) => void;
  onRefresh: () => void;
};

export function LogsToolbar({
  isSidebarOpen,
  onToggleSidebar,
  columnState,
  onColumnStateChange,
  onRefresh,
}: LogsToolbarProps) {
  const { filters, setParam, activeFilterCount } = useLogsFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        aria-label={isSidebarOpen ? "Hide filters" : "Show filters"}
        aria-pressed={isSidebarOpen}
        icon={isSidebarOpen ? <LuPanelLeftClose /> : <LuPanelLeftOpen />}
        onClick={onToggleSidebar}
      >
        {!isSidebarOpen && activeFilterCount > 0 && <span className="font-mono text-xs">{activeFilterCount}</span>}
      </Button>
      <div className="w-72">
        <CustomInput
          type="search"
          size="middle"
          aria-label="Search checks"
          placeholder="Search monitor, URL, error or code"
          value={filters.query}
          onChange={(event) => setParam("q", event.target.value, { replace: true })}
        />
      </div>
      <LogsTimeRange />
      <CustomSelect<LogsGroupBy>
        size="middle"
        aria-label="Group by"
        value={filters.groupBy}
        onChange={(value) => setParam("group", value, { fallback: "none" })}
        options={(Object.keys(GROUP_BY_LABELS) as LogsGroupBy[]).map((value) => ({
          value,
          label: value === "none" ? "No grouping" : `Group by ${GROUP_BY_LABELS[value].toLowerCase()}`,
        }))}
        className="w-44"
      />
      <ColumnsMenu columnState={columnState} onChange={onColumnStateChange} />
      <Button aria-label="Refresh" icon={<LuRefreshCw />} onClick={onRefresh} className="ml-auto" />
    </div>
  );
}
