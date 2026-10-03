import { Alert, Button, Modal, Segmented } from "antd";
import { useState } from "react";
import { LuKeyRound } from "react-icons/lu";
import { useParams } from "react-router";
import { useSaveApiKey } from "@/api/apiKeys";
import { PermissionMatrix } from "@/components/roles/PermissionMatrix";
import { CopyField } from "@/components/ui/CopyField";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { useConfirm } from "@/hooks/useConfirm";
import { useForm } from "@/hooks/useForm";
import { useCurrentRole } from "@/hooks/usePermission";
import { useToast } from "@/hooks/useToast";
import { createApiKey, EXPIRY_OPTIONS, SCOPE_PRESETS } from "@/lib/apiKeys";
import { apiKeySchema } from "@/lib/schemas";
import { currentUser } from "@/mocks/workspace";
import { useProjectOptions } from "@/hooks/useProject";

type CreateApiKeyModalProps = { open: boolean; onClose: () => void };

type Created = { name: string; secret: string };

export function CreateApiKeyModal({ open, onClose }: CreateApiKeyModalProps) {
  const confirm = useConfirm();
  const [created, setCreated] = useState<Created | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  function reset() {
    setCreated(null);
    setHasCopied(false);
    onClose();
  }

  async function close() {
    if (created && !hasCopied) {
      const isConfirmed = await confirm({
        title: "Close without copying the key?",
        description: "You won't be able to see it again. You'd need to create a new key.",
        confirmLabel: "Close anyway",
        isDanger: true,
      });
      if (!isConfirmed) return;
    }
    reset();
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      title={created ? "Copy your new key" : "Create API key"}
      footer={null}
      destroyOnHidden
      maskClosable={false}
      width={created ? "36rem" : "44rem"}
    >
      {created ? (
        <RevealStep created={created} hasCopied={hasCopied} onCopied={() => setHasCopied(true)} onDone={reset} />
      ) : (
        <ConfigureStep onCancel={close} onCreated={setCreated} />
      )}
    </Modal>
  );
}

const PRESETS = [
  { value: "read", label: "Read-only" },
  { value: "monitors", label: "Manage monitors" },
  { value: "custom", label: "Custom" },
] as const;

type Preset = (typeof PRESETS)[number]["value"];

function ConfigureStep({ onCancel, onCreated }: { onCancel: () => void; onCreated: (created: Created) => void }) {
  const projectOptions = useProjectOptions();
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const save = useSaveApiKey(orgSlug);
  const { granted } = useCurrentRole();
  const [preset, setPreset] = useState<Preset>("read");
  const [scopes, setScopes] = useState(() => new Set(SCOPE_PRESETS.read));
  const [projects, setProjects] = useState<string[]>([]);
  const [expiry, setExpiry] = useState("90");

  const { formProps, fieldErrors, setFieldErrors, formError, isPending } = useForm({
    schema: apiKeySchema,
    onSubmit: async (values) => {
      const { key, secret } = createApiKey(values, currentUser.name);
      await save.mutateAsync(key);
      toast.success("API key created", key.name);
      onCreated({ name: key.name, secret });
    },
  });

  function choosePreset(next: Preset) {
    setPreset(next);
    if (next !== "custom") setScopes(new Set(SCOPE_PRESETS[next].filter((key) => granted.has(key))));
  }

  return (
    <form {...formProps} className="flex flex-col gap-5 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      <CustomInput label="Name" name="name" autoFocus placeholder="GitHub Actions deploy" error={fieldErrors.name} />
      <FieldShell
        label="Scopes"
        labelId="key-scopes-label"
        error={fieldErrors.permissions}
        messageId="key-scopes-error"
        hint="A key can only have permissions your own role has."
      >
        <input type="hidden" name="permissions" value={[...scopes].join(",")} />
        <Segmented
          aria-labelledby="key-scopes-label"
          value={preset}
          onChange={choosePreset}
          options={PRESETS.map((item) => ({ ...item }))}
          className="w-fit"
        />
        <div className="max-h-72 overflow-y-auto rounded-md border border-line">
          <PermissionMatrix
            isCompact
            selected={scopes}
            allowed={granted}
            onChange={(next) => {
              setScopes(next);
              setPreset("custom");
              setFieldErrors((errors) => ({ ...errors, permissions: undefined }));
            }}
          />
        </div>
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="min-w-0">
          <input type="hidden" name="projects" value={projects.join(",")} />
          <CustomSelect
            label="Projects"
            mode="multiple"
            placeholder="All projects"
            value={projects}
            onChange={setProjects}
            options={projectOptions}
            hint={projects.length ? undefined : "Leave empty to allow every project."}
          />
        </div>
        <div>
          <input type="hidden" name="expiry" value={expiry} />
          <CustomSelect
            label="Expires"
            value={expiry}
            onChange={setExpiry}
            options={EXPIRY_OPTIONS}
            hint={
              expiry === "never" ? (
                <span className="text-degraded">Keys that never expire are riskier.</span>
              ) : undefined
            }
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Create key
        </Button>
      </div>
    </form>
  );
}

type RevealStepProps = {
  created: Created;
  hasCopied: boolean;
  onCopied: () => void;
  onDone: () => void;
};

function RevealStep({ created, hasCopied, onCopied, onDone }: RevealStepProps) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-line text-muted">
          <LuKeyRound aria-hidden className="size-4" />
        </span>
        <span className="flex flex-col">
          <span className="font-medium text-ink">{created.name}</span>
          <span className="text-xs text-muted">Store it in a secret manager or CI secret.</span>
        </span>
      </div>
      <CopyField value={created.secret} label="API key" onCopied={onCopied} />
      <Alert type="warning" showIcon title="This key won't be shown again. Uptrail only keeps a hash of it." />
      <pre className="overflow-x-auto rounded-md border border-line bg-panel p-3 font-mono text-xs text-muted">
        {`curl https://api.uptrail.app/v1/monitors \\\n  -H "Authorization: Bearer ${created.secret.slice(0, 18)}…"`}
      </pre>
      <div className="flex items-center justify-end gap-3">
        {!hasCopied && <span className="text-xs text-subtle">Copy the key to continue</span>}
        <Button type="primary" disabled={!hasCopied} onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
