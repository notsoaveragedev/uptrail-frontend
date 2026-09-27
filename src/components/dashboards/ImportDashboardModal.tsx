import { Button, Input, Modal, Upload } from "antd";
import { useDeferredValue, useId, useState } from "react";
import { LuCircleCheck, LuFileUp } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { useCreateDashboard } from "@/api/dashboards";
import { FieldShell } from "@/components/ui/FieldShell";
import { useToast } from "@/hooks/useToast";
import { parseDashboardJson } from "@/lib/dashboards";
import { projectLabel } from "@/lib/monitors";
import { paths } from "@/lib/paths";

const MAX_LISTED_ERRORS = 6;

type ImportDashboardModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ImportDashboardModal({ open, onClose }: ImportDashboardModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title="Import dashboard" footer={null} destroyOnHidden width="40rem">
      <ImportDashboardForm onClose={onClose} />
    </Modal>
  );
}

function ImportDashboardForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug = "" } = useParams();
  const createDashboard = useCreateDashboard(orgSlug);
  const fieldId = useId();
  const messageId = `${fieldId}-message`;
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);
  const result = deferredText.trim() ? parseDashboardJson(deferredText) : null;
  const errors = result?.errors ?? [];
  const dashboard = text === deferredText ? (result?.dashboard ?? null) : null;

  function importDashboard() {
    if (!dashboard) return;
    createDashboard.mutate(dashboard, {
      onSuccess: () => {
        onClose();
        toast.success("Dashboard imported", `${dashboard.name} · ${dashboard.widgets.length} widgets`);
        navigate(paths.dashboard(orgSlug, dashboard.id));
      },
      onError: () => toast.error("Couldn't import the dashboard", "Try again in a moment."),
    });
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <FieldShell
        label="Dashboard JSON"
        htmlFor={fieldId}
        messageId={messageId}
        labelAction={
          <Upload
            accept=".json,application/json"
            showUploadList={false}
            beforeUpload={(file) => {
              void file.text().then(setText);
              return false;
            }}
          >
            <Button size="small" type="text" icon={<LuFileUp />} className="text-muted">
              Choose file
            </Button>
          </Upload>
        }
      >
        <Input.TextArea
          id={fieldId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={'{\n  "name": "Checkout health",\n  "widgets": [],\n  "layouts": { "lg": [] }\n}'}
          autoSize={{ minRows: 10, maxRows: 16 }}
          spellCheck={false}
          wrap="off"
          aria-invalid={errors.length > 0 ? true : undefined}
          aria-describedby={messageId}
          className="font-mono text-xs"
        />
      </FieldShell>

      <div id={messageId} aria-live="polite">
        {errors.length > 0 && <ImportErrors errors={errors} />}
        {dashboard && (
          <p className="flex items-center gap-2 text-xs text-muted">
            <LuCircleCheck aria-hidden className="size-3.5 text-up" />
            <span>
              <span className="text-ink">{dashboard.name}</span> · {projectLabel(dashboard.project)} ·{" "}
              {dashboard.widgets.length} widgets, ready to import
            </span>
          </p>
        )}
        {!result && <p className="text-xs text-subtle">Paste JSON exported from a dashboard, or choose a file.</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" disabled={!dashboard} loading={createDashboard.isPending} onClick={importDashboard}>
          Import
        </Button>
      </div>
    </div>
  );
}

function ImportErrors({ errors }: { errors: string[] }) {
  const hidden = errors.length - MAX_LISTED_ERRORS;

  return (
    <div role="alert" className="flex flex-col gap-1.5 rounded-md border border-line bg-down-soft px-3 py-2.5">
      <span className="text-xs font-medium text-down">
        {errors.length === 1 ? "1 problem" : `${errors.length} problems`} to fix before importing
      </span>
      <ul className="flex flex-col gap-0.5 font-mono text-xs text-ink">
        {errors.slice(0, MAX_LISTED_ERRORS).map((error, index) => (
          <li key={index}>{error}</li>
        ))}
        {hidden > 0 && <li className="text-muted">and {hidden} more</li>}
      </ul>
    </div>
  );
}
