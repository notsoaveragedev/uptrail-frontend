import { Button } from "antd";
import { LuBellOff, LuBellRing, LuTrash2 } from "react-icons/lu";
import { useParams } from "react-router";
import { useDeleteAlertRule, useRestoreAlertRule, useToggleAlertRule } from "@/api/alerts";
import { SelectionBar, SelectionBarDivider } from "@/components/ui/SelectionBar";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { pluralRules } from "@/lib/alertLists";
import type { AlertRule } from "@/types/alerts";

type RuleBulkBarProps = {
  selected: AlertRule[];
  onClear: () => void;
};

export function RuleBulkBar({ selected, onClear }: RuleBulkBarProps) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const toggleRule = useToggleAlertRule(orgSlug);
  const deleteRule = useDeleteAlertRule(orgSlug);
  const restoreRule = useRestoreAlertRule(orgSlug);
  const count = selected.length;

  function setEnabled(enabled: boolean) {
    selected.forEach((rule) => toggleRule.mutate({ id: rule.id, enabled }));
    toast.success(enabled ? "Rules enabled" : "Rules disabled", pluralRules(count));
    onClear();
  }

  async function remove() {
    const isConfirmed = await confirm({
      title: `Delete ${pluralRules(count)}?`,
      description: "They stop evaluating right away. Past alert history is kept.",
      confirmLabel: "Delete",
      isDanger: true,
    });
    if (!isConfirmed) return;
    const removed = [...selected];
    removed.forEach((rule) => deleteRule.mutate(rule.id));
    toast.success("Rules deleted", pluralRules(count), {
      label: "Undo",
      onClick: () => removed.forEach((rule) => restoreRule.mutate(rule)),
    });
    onClear();
  }

  return (
    <SelectionBar count={count} onClear={onClear}>
      <Button type="text" icon={<LuBellRing />} onClick={() => setEnabled(true)}>
        Enable
      </Button>
      <Button type="text" icon={<LuBellOff />} onClick={() => setEnabled(false)}>
        Disable
      </Button>
      <SelectionBarDivider />
      <Button type="text" danger icon={<LuTrash2 />} onClick={remove}>
        Delete
      </Button>
    </SelectionBar>
  );
}
