import { Button, Input, Modal } from "antd";
import { useState, type FormEvent } from "react";
import { LuGlobe } from "react-icons/lu";
import { FieldShell } from "@/components/ui/FieldShell";
import type { Incident } from "@/types/incident";
import { SwitchField } from "@/components/ui/SwitchField";
import { useIncidentActions } from "./useIncidentActions";

type ResolveIncidentModalProps = {
  incident: Incident;
  open: boolean;
  onClose: () => void;
};

export function ResolveIncidentModal({ incident, open, onClose }: ResolveIncidentModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title={`Resolve ${incident.id}?`} footer={null} destroyOnHidden width="30rem">
      <ResolveForm incident={incident} onClose={onClose} />
    </Modal>
  );
}

function ResolveForm({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const actions = useIncidentActions();
  const [note, setNote] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    actions.resolve(incident, note.trim(), isPublic);
    onClose();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 pt-2">
      <p className="text-muted">The timer stops and the incident moves to Resolved. You can reopen it later.</p>
      <FieldShell label="Closing note (optional)" htmlFor="resolve-note">
        <Input.TextArea
          id="resolve-note"
          rows={3}
          autoFocus
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="This incident has been resolved."
        />
      </FieldShell>
      <SwitchField
        icon={<LuGlobe aria-hidden className="size-3.5 text-subtle" />}
        label="Publish to status page"
        checked={isPublic}
        onChange={setIsPublic}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Resolve incident
        </Button>
      </div>
    </form>
  );
}
