import { Button } from "antd";
import { LuCheckCheck } from "react-icons/lu";
import { useParams } from "react-router";
import { useAcknowledgeAlert } from "@/api/alerts";
import { SelectionBar } from "@/components/ui/SelectionBar";
import { useToast } from "@/hooks/useToast";
import { plural } from "@/lib/format";

type HistoryBulkBarProps = {
  selectedIds: string[];
  onClear: () => void;
};

export function HistoryBulkBar({ selectedIds, onClear }: HistoryBulkBarProps) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const acknowledge = useAcknowledgeAlert(orgSlug);
  const count = selectedIds.length;

  function acknowledgeAll() {
    selectedIds.forEach((id) => acknowledge.mutate(id));
    toast.success("Alerts acknowledged", plural(count, "alert"));
    onClear();
  }

  return (
    <SelectionBar count={count} onClear={onClear}>
      <Button type="text" icon={<LuCheckCheck />} onClick={acknowledgeAll}>
        Acknowledge
      </Button>
    </SelectionBar>
  );
}
