import { Button, Tooltip } from "antd";
import { Link } from "react-router";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { paths } from "@/lib/paths";
import type { ConditionValidity } from "./ruleFormUtils";

type RuleEditorHeaderProps = {
  orgSlug: string;
  title: string;
  isNew: boolean;
  isDirty: boolean;
  validity: ConditionValidity;
  fireCount: number | null;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
};

const VALIDITY_TEXT: Record<ConditionValidity, { label: string; className: string }> = {
  valid: { label: "valid", className: "text-up" },
  invalid: { label: "1 error", className: "text-down" },
  incomplete: { label: "incomplete", className: "text-degraded" },
};

function draftState(isNew: boolean, isDirty: boolean) {
  if (isNew) return "Draft";
  return isDirty ? "Unsaved changes" : "Saved";
}

export function RuleEditorHeader({
  orgSlug,
  title,
  isNew,
  isDirty,
  validity,
  fireCount,
  isSaving,
  onCancel,
  onSave,
}: RuleEditorHeaderProps) {
  const { label, className } = VALIDITY_TEXT[validity];

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
        <Link to={paths.alerts(orgSlug)}>Alerts</Link>
        <span aria-hidden className="text-faint">
          /
        </span>
        <Link to={paths.alertRules(orgSlug)}>Rules</Link>
        <span aria-hidden className="text-faint">
          /
        </span>
        <span aria-current="page" className="truncate text-ink">
          {title}
        </span>
      </nav>

      <PageHeader
        title={title}
        meta={
          <MetaList role="status">
            <span className="flex items-center gap-1.5">
              {isDirty && <StatusDot fill="bg-degraded" />}
              {draftState(isNew, isDirty)}
            </span>
            <span className={className}>{label}</span>
            {fireCount !== null && validity === "valid" && (
              <span>
                {fireCount === 0 ? (
                  "wouldn't have fired in 24h"
                ) : (
                  <>
                    would fire <span className="font-mono text-ink">{fireCount}×</span> in 24h
                  </>
                )}
              </span>
            )}
          </MetaList>
        }
        actions={
          <>
            <Button onClick={onCancel}>Cancel</Button>
            <Tooltip
              title={
                <span className="flex items-center gap-1.5">
                  Save <kbd className="kbd">⌘S</kbd>
                </span>
              }
            >
              <Button type="primary" loading={isSaving} onClick={onSave}>
                Save rule
              </Button>
            </Tooltip>
          </>
        }
      />
    </div>
  );
}
