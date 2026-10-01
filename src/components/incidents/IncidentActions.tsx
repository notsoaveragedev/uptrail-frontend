import { Button, Dropdown, Space } from "antd";
import { useState } from "react";
import { LuCheckCheck, LuCircleCheck, LuEllipsis, LuFileText, LuLink, LuRotateCcw, LuTrash2 } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { useDeleteIncident, useRestoreIncident } from "@/api/incidents";
import { useConfirm } from "@/hooks/useConfirm";
import { useCopy } from "@/hooks/useCopy";
import { useToast } from "@/hooks/useToast";
import { SEVERITIES, SEVERITY_LABELS } from "@/lib/alerts";
import { isIncidentOpen } from "@/lib/incidents";
import { paths } from "@/lib/paths";
import type { Severity } from "@/types/alerts";
import type { Incident } from "@/types/incident";
import { ResolveIncidentModal } from "./ResolveIncidentModal";
import { useIncidentActions } from "./useIncidentActions";

type IncidentActionsProps = {
  incident: Incident;
  onWritePostmortem: () => void;
};

export function IncidentActions({ incident, onWritePostmortem }: IncidentActionsProps) {
  const actions = useIncidentActions();
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const menu = useIncidentMenu(incident);

  if (!isIncidentOpen(incident)) {
    return (
      <div className="flex items-center gap-2">
        <Button icon={<LuRotateCcw />} onClick={() => actions.reopen(incident)}>
          Reopen
        </Button>
        <Button type="primary" icon={<LuFileText />} onClick={onWritePostmortem}>
          Write postmortem
        </Button>
        <Dropdown trigger={["click"]} menu={menu}>
          <Button aria-label="More incident actions" icon={<LuEllipsis />} />
        </Dropdown>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!incident.acknowledgedAt && (
        <Button icon={<LuCheckCheck />} onClick={() => actions.acknowledge(incident)}>
          Acknowledge
        </Button>
      )}
      <Space.Compact>
        <Button type="primary" icon={<LuCircleCheck />} onClick={() => setIsResolveOpen(true)}>
          Resolve
        </Button>
        <Dropdown trigger={["click"]} menu={menu} placement="bottomRight">
          <Button type="primary" aria-label="More incident actions" icon={<LuEllipsis />} />
        </Dropdown>
      </Space.Compact>
      <ResolveIncidentModal incident={incident} open={isResolveOpen} onClose={() => setIsResolveOpen(false)} />
    </div>
  );
}

function useIncidentMenu(incident: Incident) {
  const { orgSlug = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const copy = useCopy();
  const actions = useIncidentActions();
  const deleteIncident = useDeleteIncident(orgSlug);
  const restoreIncident = useRestoreIncident(orgSlug);

  async function remove() {
    const isConfirmed = await confirm({
      title: `Delete ${incident.id}?`,
      description: "The incident and its timeline are removed for everyone, including the status page.",
      confirmLabel: "Delete",
      isDanger: true,
    });
    if (!isConfirmed) return;
    deleteIncident.mutate(incident.id);
    navigate(paths.incidents(orgSlug));
    toast.success(`${incident.id} deleted`, incident.title, {
      label: "Undo",
      onClick: () => restoreIncident.mutate(incident),
    });
  }

  function handleClick(key: string) {
    if (key === "copy") copy(`${window.location.origin}${paths.incident(orgSlug, incident.id)}`, "Link copied");
    else if (key === "delete") remove();
    else if (key !== incident.severity) actions.setSeverity(incident, key as Severity);
  }

  return {
    items: [
      {
        key: "severity",
        label: "Change severity",
        children: [...SEVERITIES].reverse().map((severity) => ({
          key: severity,
          label: SEVERITY_LABELS[severity],
          disabled: severity === incident.severity,
        })),
      },
      { key: "copy", icon: <LuLink />, label: "Copy link" },
      { type: "divider" as const },
      { key: "delete", icon: <LuTrash2 />, label: "Delete incident", danger: true },
    ],
    onClick: ({ key }: { key: string }) => handleClick(key),
  };
}
