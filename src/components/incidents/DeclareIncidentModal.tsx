import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Input, Modal, Segmented } from "antd";
import { useState } from "react";
import { LuBellRing, LuGlobe } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { alertChannelsQuery } from "@/api/alerts";
import { useDeclareIncident } from "@/api/incidents";
import { monitorsQuery } from "@/api/monitors";
import { ChannelIcon } from "@/components/alerts/ChannelIcon";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { StatusDot } from "@/components/ui/StatusDot";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { SEVERITIES, SEVERITY_LABELS, SEVERITY_TONE } from "@/lib/alerts";
import { buildIncidentDraft, OPEN_STATUSES, UNASSIGNED } from "@/lib/incidents";
import { PROJECT_OPTIONS } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import { declareIncidentSchema } from "@/lib/schemas";
import { STATUS_FILL, TONE_TEXT } from "@/lib/status";
import { INCIDENT_PEOPLE } from "@/mocks/incidents";
import { currentUser } from "@/mocks/workspace";
import type { Severity } from "@/types/alerts";
import type { IncidentStatus } from "@/types/incident";
import { IncidentStatusPill } from "./IncidentStatusPill";
import { SwitchField } from "@/components/ui/SwitchField";

type DeclareIncidentModalProps = {
  open: boolean;
  onClose: () => void;
};

export function DeclareIncidentModal({ open, onClose }: DeclareIncidentModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title="Declare incident" footer={null} destroyOnHidden width="40rem">
      <DeclareIncidentForm onClose={onClose} />
    </Modal>
  );
}

function DeclareIncidentForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug = "" } = useParams();
  const declare = useDeclareIncident(orgSlug);
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const { data: channels = [] } = useQuery(alertChannelsQuery(orgSlug));
  const [severity, setSeverity] = useState<Severity>("major");
  const [status, setStatus] = useState<IncidentStatus>("investigating");
  const [monitorIds, setMonitorIds] = useState<string[]>([]);
  const [assignee, setAssignee] = useState(currentUser.name);
  const [isPublished, setIsPublished] = useState(true);
  const [isNotifying, setIsNotifying] = useState(false);
  const [channelIds, setChannelIds] = useState<string[]>([]);

  const { formProps, fieldErrors, setFieldErrors, formError, isPending } = useForm({
    schema: declareIncidentSchema,
    onSubmit: async (values) => {
      const project = monitors.find((monitor) => monitor.id === values.monitorIds[0])?.project;
      const channelNames = values.notify
        ? channels.filter((channel) => values.channelIds.includes(channel.id)).map((channel) => channel.name)
        : [];
      const draft = buildIncidentDraft(values, {
        project: project ?? PROJECT_OPTIONS[0].value,
        author: currentUser.name,
        channelNames,
        now: Date.now(),
      });
      const incident = await declare.mutateAsync(draft);
      const incidentPath = paths.incident(orgSlug, incident.id);
      onClose();
      toast.success(`${incident.id} declared`, incident.title, {
        label: "View",
        onClick: () => navigate(incidentPath),
      });
      navigate(incidentPath);
    },
  });

  function changeChannels(next: string[]) {
    setChannelIds(next);
    setFieldErrors((errors) => ({ ...errors, channelIds: undefined }));
  }

  return (
    <form {...formProps} className="flex flex-col gap-5 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      <CustomInput
        label="Title"
        name="title"
        placeholder="Checkout failing for some customers"
        autoFocus
        error={fieldErrors.title}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Severity" labelId="declare-severity-label">
          <input type="hidden" name="severity" value={severity} />
          <Segmented
            block
            size="large"
            aria-labelledby="declare-severity-label"
            value={severity}
            onChange={setSeverity}
            options={SEVERITIES.map((value) => ({
              value,
              label: (
                <span className="flex items-center justify-center gap-2">
                  <StatusDot className={TONE_TEXT[SEVERITY_TONE[value]]} />
                  {SEVERITY_LABELS[value]}
                </span>
              ),
            }))}
          />
        </FieldShell>
        <div>
          <input type="hidden" name="status" value={status} />
          <CustomSelect
            label="Initial status"
            value={status}
            onChange={setStatus}
            options={OPEN_STATUSES.map((value) => ({ value, label: <IncidentStatusPill status={value} /> }))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0">
          <input type="hidden" name="monitorIds" value={monitorIds.join(",")} />
          <CustomSelect
            label="Affected monitors"
            mode="multiple"
            placeholder="Select monitors"
            value={monitorIds}
            onChange={setMonitorIds}
            optionFilterProp="title"
            maxTagCount="responsive"
            options={monitors.map((monitor) => ({
              value: monitor.id,
              title: monitor.name,
              label: (
                <span className="flex items-center gap-2">
                  <StatusDot fill={STATUS_FILL[monitor.status]} />
                  {monitor.name}
                </span>
              ),
            }))}
          />
        </div>
        <div>
          <input type="hidden" name="assignee" value={assignee === UNASSIGNED ? "" : assignee} />
          <CustomSelect
            label="Assignee"
            value={assignee}
            onChange={setAssignee}
            options={[
              { value: currentUser.name, label: `${currentUser.name} (you)` },
              ...INCIDENT_PEOPLE.filter((name) => name !== currentUser.name).map((name) => ({
                value: name,
                label: name,
              })),
              { value: UNASSIGNED, label: "Unassigned" },
            ]}
          />
        </div>
      </div>

      <FieldShell
        label="Message"
        htmlFor="declare-message"
        error={fieldErrors.message}
        messageId="declare-message-error"
        hint="Markdown supported: **bold**, `code`, lists and links."
      >
        <Input.TextArea
          id="declare-message"
          name="message"
          rows={4}
          placeholder="We're investigating failed checkouts for some customers."
          status={fieldErrors.message ? "error" : undefined}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? "declare-message-error" : undefined}
        />
      </FieldShell>

      <div className="flex flex-col gap-4 rounded-lg border border-line p-4">
        <SwitchField
          name="publish"
          icon={<LuGlobe aria-hidden className="size-3.5 text-subtle" />}
          label="Publish to status page"
          hint="Visitors see the title, status and this message."
          checked={isPublished}
          onChange={setIsPublished}
        />
        <SwitchField
          name="notify"
          icon={<LuBellRing aria-hidden className="size-3.5 text-subtle" />}
          label="Notify channels"
          hint="Send the declaration to your alert channels."
          checked={isNotifying}
          onChange={setIsNotifying}
        />
        {isNotifying && (
          <div>
            <input type="hidden" name="channelIds" value={channelIds.join(",")} />
            <CustomSelect
              aria-label="Channels to notify"
              mode="multiple"
              size="middle"
              placeholder="Select channels"
              value={channelIds}
              onChange={changeChannels}
              optionFilterProp="title"
              error={fieldErrors.channelIds}
              options={channels.map((channel) => ({
                value: channel.id,
                title: channel.name,
                label: (
                  <span className="flex items-center gap-2">
                    <ChannelIcon type={channel.type} className="size-3.5" />
                    {channel.name}
                  </span>
                ),
              }))}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Declare incident
        </Button>
      </div>
    </form>
  );
}
