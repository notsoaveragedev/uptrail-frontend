import { Switch } from "antd";
import { useParams } from "react-router";
import { useToggleAlertRule } from "@/api/alerts";
import { useToast } from "@/hooks/useToast";
import type { AlertRule } from "@/types/alerts";

export function RuleEnabledSwitch({ rule }: { rule: AlertRule }) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const toggleRule = useToggleAlertRule(orgSlug);

  function toggle(enabled: boolean) {
    toggleRule.mutate(
      { id: rule.id, enabled },
      {
        onError: () =>
          toast.error(`Couldn't ${enabled ? "enable" : "disable"} ${rule.name}`, "Your change was rolled back.", {
            label: "Retry",
            onClick: () => toggle(enabled),
          }),
      },
    );
  }

  return (
    <Switch
      size="small"
      checked={rule.enabled}
      onChange={toggle}
      aria-label={`${rule.enabled ? "Disable" : "Enable"} ${rule.name}`}
    />
  );
}
