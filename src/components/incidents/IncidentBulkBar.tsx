import { Button, Dropdown } from "antd";
import { LuCircleCheck, LuUserPlus } from "react-icons/lu";
import { useParams } from "react-router";
import { useIncidentChange } from "@/api/incidents";
import { SelectionBar } from "@/components/ui/SelectionBar";
import { ToolbarDivider } from "@/components/ui/ToolbarDivider";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { isIncidentOpen, UNASSIGNED } from "@/lib/incidents";
import { shortName } from "@/lib/people";
import { INCIDENT_PEOPLE } from "@/mocks/incidents";
import { currentUser } from "@/mocks/workspace";
import type { Incident } from "@/types/incident";
import { plural } from "@/lib/format";

type IncidentBulkBarProps = {
  selected: Incident[];
  onClear: () => void;
};

export function IncidentBulkBar({ selected, onClear }: IncidentBulkBarProps) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const change = useIncidentChange(orgSlug);
  const open = selected.filter(isIncidentOpen);

  function assign(key: string) {
    const assignee = key === UNASSIGNED ? null : key;
    selected.forEach((incident) => change.mutate({ incidentId: incident.id, change: { type: "assign", assignee } }));
    toast.success(assignee ? `Assigned to ${shortName(assignee)}` : "Unassigned", plural(selected.length, "incident"));
    onClear();
  }

  async function resolve() {
    const isConfirmed = await confirm({
      title: `Resolve ${plural(open.length, "incident")}?`,
      description: "Each incident gets a resolved update on its timeline. You can reopen them later.",
      confirmLabel: "Resolve",
    });
    if (!isConfirmed) return;
    open.forEach((incident) =>
      change.mutate({ incidentId: incident.id, change: { type: "resolve", isPublic: false } }),
    );
    toast.success("Incidents resolved", plural(open.length, "incident"));
    onClear();
  }

  const people = [currentUser.name, ...INCIDENT_PEOPLE.filter((name) => name !== currentUser.name)];

  return (
    <SelectionBar count={selected.length} onClear={onClear}>
      <Dropdown
        trigger={["click"]}
        menu={{
          items: [
            ...people.map((name) => ({ key: name, label: name === currentUser.name ? `${name} (you)` : name })),
            { type: "divider" as const },
            { key: UNASSIGNED, label: "Unassign" },
          ],
          onClick: ({ key }) => assign(key),
        }}
      >
        <Button type="text" icon={<LuUserPlus />}>
          Assign
        </Button>
      </Dropdown>
      <ToolbarDivider />
      <Button type="text" icon={<LuCircleCheck />} disabled={open.length === 0} onClick={resolve}>
        Resolve
      </Button>
    </SelectionBar>
  );
}
