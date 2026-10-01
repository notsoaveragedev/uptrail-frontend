import { Button, Dropdown } from "antd";
import { LuChevronDown } from "react-icons/lu";
import { shortName, UNASSIGNED } from "@/lib/incidents";
import { INCIDENT_PEOPLE } from "@/mocks/incidents";
import { currentUser } from "@/mocks/workspace";
import type { Incident } from "@/types/incident";
import { AssigneeAvatar } from "./AssigneeAvatar";
import { useIncidentActions } from "./useIncidentActions";

export function AssigneeMenu({ incident }: { incident: Incident }) {
  const actions = useIncidentActions();
  const people = [currentUser.name, ...INCIDENT_PEOPLE.filter((name) => name !== currentUser.name)];

  function select(key: string) {
    const assignee = key === UNASSIGNED ? null : key;
    if (assignee !== incident.assignee) actions.assign(incident, assignee);
  }

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        selectable: true,
        selectedKeys: [incident.assignee ?? UNASSIGNED],
        items: [
          ...people.map((name) => ({
            key: name,
            label: (
              <span className="flex items-center gap-2">
                <AssigneeAvatar name={name} hasTooltip={false} />
                {name}
                {name === currentUser.name && <span className="text-subtle">(you)</span>}
              </span>
            ),
          })),
          { type: "divider" as const },
          { key: UNASSIGNED, label: "Unassigned" },
        ],
        onClick: ({ key }) => select(key),
      }}
    >
      <Button type="text" size="small" aria-label={`Assignee: ${incident.assignee ?? "unassigned"}. Change assignee`}>
        <span className="flex items-center gap-2">
          <AssigneeAvatar name={incident.assignee} hasTooltip={false} />
          {incident.assignee ? shortName(incident.assignee) : "Unassigned"}
          <LuChevronDown aria-hidden className="size-3.5 text-subtle" />
        </span>
      </Button>
    </Dropdown>
  );
}
