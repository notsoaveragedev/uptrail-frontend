import { Alert, Avatar, Button, Modal } from "antd";
import { LuMinus, LuPlus } from "react-icons/lu";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { permissionLabel } from "@/lib/permissions";
import type { Member } from "@/types/member";
import { plural } from "@/lib/format";

type RoleDiffModalProps = {
  open: boolean;
  roleName: string;
  added: string[];
  removed: string[];
  detailsChanged: boolean;
  affected: Member[];
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function RoleDiffModal({
  open,
  roleName,
  added,
  removed,
  detailsChanged,
  affected,
  isSaving,
  onCancel,
  onConfirm,
}: RoleDiffModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Save changes to ${roleName}?`}
      width="36rem"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Keep editing</Button>
          <Button type="primary" loading={isSaving} onClick={onConfirm}>
            Save role
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pt-1">
        {(added.length > 0 || removed.length > 0) && (
          <ul className="flex max-h-72 flex-col divide-y divide-line overflow-y-auto rounded-md border border-line">
            {added.map((key) => (
              <DiffRow key={key} permission={key} isAdded />
            ))}
            {removed.map((key) => (
              <DiffRow key={key} permission={key} isAdded={false} />
            ))}
          </ul>
        )}
        {detailsChanged && <p className="text-muted">The name or description also changed.</p>}
        <div className="flex items-center gap-3 rounded-md bg-panel px-3 py-2.5">
          {affected.length > 0 && (
            <Avatar.Group max={{ count: 4 }} size="small">
              {affected.map((member) => (
                <PersonAvatar key={member.id} name={member.name} />
              ))}
            </Avatar.Group>
          )}
          <span className="text-muted">
            {affected.length > 0 ? (
              <>
                Affects <span className="text-ink">{plural(affected.length, "member")}</span> the next time they load a
                page.
              </>
            ) : (
              "No members have this role yet."
            )}
          </span>
        </div>
        {removed.length > 0 && affected.length > 0 && (
          <Alert
            type="warning"
            showIcon
            title="Removed permissions take effect immediately for everyone with this role."
          />
        )}
      </div>
    </Modal>
  );
}

function DiffRow({ permission, isAdded }: { permission: string; isAdded: boolean }) {
  return (
    <li className={`flex items-center gap-3 px-3 py-2 ${isAdded ? "bg-up-soft/50" : "bg-down-soft/50"}`}>
      {isAdded ? (
        <LuPlus aria-label="Added" className="size-3.5 shrink-0 text-up" />
      ) : (
        <LuMinus aria-label="Removed" className="size-3.5 shrink-0 text-down" />
      )}
      <span className="flex-1 text-ink first-letter:uppercase">{permissionLabel(permission)}</span>
      <span className="font-mono text-xs text-subtle">{permission}</span>
    </li>
  );
}
