import { Button, Input, Segmented, Tabs } from "antd";
import { useRef, useState, type KeyboardEvent } from "react";
import { LuGlobe } from "react-icons/lu";
import { FieldShell } from "@/components/ui/FieldShell";
import { useForm } from "@/hooks/useForm";
import { INCIDENT_STATUS_LABELS, INCIDENT_STATUSES } from "@/lib/incidents";
import { incidentUpdateSchema } from "@/lib/schemas";
import type { Incident, IncidentStatus } from "@/types/incident";
import { MarkdownText } from "@/components/ui/MarkdownText";
import { SwitchField } from "./SwitchField";
import { useIncidentActions } from "./useIncidentActions";

type UpdateComposerProps = {
  incident: Incident;
  initialMessage?: string;
};

export function UpdateComposer({ incident, initialMessage = "" }: UpdateComposerProps) {
  const [isExpanded, setIsExpanded] = useState(initialMessage !== "");

  if (!isExpanded) {
    return (
      <Input
        size="large"
        aria-label="Post an update"
        placeholder="Post an update…"
        onFocus={() => setIsExpanded(true)}
      />
    );
  }

  return <ComposerForm incident={incident} initialMessage={initialMessage} onClose={() => setIsExpanded(false)} />;
}

type ComposerFormProps = {
  incident: Incident;
  initialMessage: string;
  onClose: () => void;
};

function ComposerForm({ incident, initialMessage, onClose }: ComposerFormProps) {
  const actions = useIncidentActions();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [message, setMessage] = useState(initialMessage);
  const [isPublic, setIsPublic] = useState(!initialMessage);
  const [mode, setMode] = useState("write");

  const { formProps, fieldErrors } = useForm({
    schema: incidentUpdateSchema,
    onSubmit: async (values) => {
      actions.postUpdate(incident, { type: "update", ...values });
      onClose();
    },
  });

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
    if (event.key === "Escape" && !message) onClose();
  }

  const editor = (
    <FieldShell error={fieldErrors.message} messageId="composer-message-error">
      <Input.TextArea
        name="message"
        aria-label="Update message"
        autoFocus
        autoSize={{ minRows: 4, maxRows: 14 }}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What changed? Markdown supported."
        status={fieldErrors.message ? "error" : undefined}
        aria-invalid={fieldErrors.message ? true : undefined}
        aria-describedby={fieldErrors.message ? "composer-message-error" : undefined}
      />
    </FieldShell>
  );

  return (
    <form
      ref={formRef}
      {...formProps}
      aria-label="Post an update"
      className="flex flex-col gap-3 rounded-lg border border-line-strong bg-card p-3"
    >
      <input type="hidden" name="status" value={status} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented
          size="small"
          aria-label="Status"
          value={status}
          onChange={setStatus}
          options={INCIDENT_STATUSES.map((value) => ({ value, label: INCIDENT_STATUS_LABELS[value] }))}
        />
        <Tabs
          size="small"
          activeKey={mode}
          onChange={setMode}
          className="[&_.ant-tabs-nav]:mb-0"
          items={[
            { key: "write", label: "Write" },
            { key: "preview", label: "Preview" },
          ]}
        />
      </div>
      {mode === "write" ? (
        editor
      ) : (
        <div className="min-h-24 rounded-md border border-line px-3 py-2">
          {message.trim() ? (
            <MarkdownText source={message} className="text-muted" />
          ) : (
            <p className="text-subtle">Nothing to preview yet.</p>
          )}
          <input type="hidden" name="message" value={message} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
        <div className="w-60">
          <SwitchField
            name="isPublic"
            icon={<LuGlobe aria-hidden className="size-3.5 text-subtle" />}
            label="Publish to status page"
            checked={isPublic}
            onChange={setIsPublic}
          />
        </div>
        <span className="ml-auto flex items-center gap-1 text-xs text-subtle">
          <kbd className="kbd">⌘</kbd>
          <kbd className="kbd">↵</kbd>
          to post
        </span>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Post update
        </Button>
      </div>
    </form>
  );
}
