import { Button, Modal, Segmented } from "antd";
import { useRef, useState, type FormEvent } from "react";
import { LuSend } from "react-icons/lu";
import { useParams } from "react-router";
import { useSaveAlertChannel } from "@/api/alerts";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { useChannelTest } from "@/hooks/useChannelTest";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { CHANNEL_TYPE_LABELS, CHANNEL_TYPES } from "@/lib/alerts";
import { buildChannel, NAME_PLACEHOLDER, newChannelId, TARGET_FIELD, WEBHOOK_METHODS } from "@/lib/alertLists";
import { alertChannelSchema } from "@/lib/schemas";
import type { AlertChannel, ChannelType } from "@/types/alerts";
import { ChannelIcon } from "./ChannelIcon";
import { TestResultRow } from "./TestResultRow";

type ChannelModalProps = {
  open: boolean;
  channel: AlertChannel | null;
  onClose: () => void;
};

export function ChannelModal({ open, channel, onClose }: ChannelModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={channel ? "Edit channel" : "Add channel"}
      footer={null}
      destroyOnHidden
      width="30rem"
    >
      <ChannelForm channel={channel} onClose={onClose} />
    </Modal>
  );
}

function ChannelForm({ channel, onClose }: { channel: AlertChannel | null; onClose: () => void }) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [id] = useState(() => channel?.id ?? newChannelId());
  const [type, setType] = useState<ChannelType>(channel?.type ?? "email");
  const [method, setMethod] = useState<(typeof WEBHOOK_METHODS)[number]>("POST");
  const [testedAt, setTestedAt] = useState(0);
  const test = useChannelTest(orgSlug);
  const saveChannel = useSaveAlertChannel(orgSlug);
  const field = TARGET_FIELD[type];

  const { formProps, fieldErrors, setFieldErrors } = useForm({
    schema: alertChannelSchema,
    onSubmit: async (values) => {
      const outcome = test.result && { ok: test.result.ok, at: testedAt };
      saveChannel.mutate(buildChannel(id, values, channel, outcome), {
        onError: () => toast.error("Couldn't save the channel", "Your changes were rolled back."),
      });
      toast.success(channel ? "Channel saved" : "Channel added", values.name);
      onClose();
    },
  });

  function changeType(next: ChannelType) {
    setType(next);
    setFieldErrors({});
    test.reset();
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    formProps.onChange(event);
    if ((event.target as HTMLInputElement).name === "target") test.reset();
  }

  async function sendTest() {
    if (!formRef.current) return;
    const values = Object.fromEntries(new FormData(formRef.current));
    const parsed = alertChannelSchema.safeParse({ ...values, name: values.name || NAME_PLACEHOLDER[type] });
    if (!parsed.success) {
      const [issue] = parsed.error.issues;
      setFieldErrors(issue.path[0] === "name" ? { name: issue.message } : { target: issue.message });
      return;
    }
    setTestedAt(Date.now());
    await test.send(buildChannel(id, parsed.data, channel, null), channel !== null);
  }

  return (
    <form ref={formRef} {...formProps} onChange={handleChange} className="flex flex-col gap-4 pt-2">
      <input type="hidden" name="type" value={type} />
      <FieldShell label="Type" labelId="channel-type-label">
        <Segmented
          block
          aria-labelledby="channel-type-label"
          value={type}
          disabled={channel !== null}
          onChange={changeType}
          options={CHANNEL_TYPES.map((value) => ({
            value,
            label: (
              <span className="flex items-center justify-center gap-1.5">
                <ChannelIcon type={value} className="size-3.5" />
                {CHANNEL_TYPE_LABELS[value]}
              </span>
            ),
          }))}
        />
      </FieldShell>
      <CustomInput
        key={`name-${type}`}
        label="Name"
        name="name"
        defaultValue={channel?.name}
        placeholder={NAME_PLACEHOLDER[type]}
        autoFocus
        error={fieldErrors.name}
      />
      <div className="flex items-start gap-2">
        {type === "webhook" && (
          <div className="w-28 shrink-0">
            <input type="hidden" name="method" value={method} />
            <CustomSelect
              label="Method"
              value={method}
              onChange={setMethod}
              options={WEBHOOK_METHODS.map((value) => ({ value, label: value }))}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <CustomInput
            key={`target-${type}`}
            label={field.label}
            name="target"
            inputMode={type === "email" ? "email" : "url"}
            spellCheck={false}
            defaultValue={channel?.target}
            placeholder={field.placeholder}
            hint={fieldErrors.target ? undefined : field.hint}
            error={fieldErrors.target}
          />
        </div>
      </div>
      {test.result && <TestResultRow result={test.result} />}
      <div className="flex items-center gap-2 border-t border-line pt-4">
        <Button icon={<LuSend />} loading={test.isSending} onClick={sendTest}>
          Send test
        </Button>
        <span className="flex-1" />
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          {channel ? "Save changes" : "Add channel"}
        </Button>
      </div>
    </form>
  );
}
