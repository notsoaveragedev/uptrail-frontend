import { Modal } from "antd";
import { useCurrentRole } from "@/hooks/usePermission";
import { shortcutGroups } from "@/lib/shortcuts";

type ShortcutsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const { granted } = useCurrentRole();

  return (
    <Modal title="Keyboard shortcuts" open={open} onCancel={onClose} footer={null} width="44rem">
      <div className="gap-x-10 pt-2 sm:columns-2">
        {shortcutGroups(granted).map((group) => (
          <section key={group.title} className="mb-6 flex break-inside-avoid flex-col gap-2">
            <h3 className="text-caps font-semibold tracking-widest text-subtle uppercase">{group.title}</h3>
            <dl className="flex flex-col">
              {group.shortcuts.map((shortcut) => (
                <div key={shortcut.label} className="flex h-8 items-center justify-between gap-4">
                  <dt className="text-muted">{shortcut.label}</dt>
                  <dd className="flex items-center gap-1">
                    {shortcut.keys.map((key, index) => (
                      <kbd key={index} className="kbd">
                        {key}
                      </kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <p className="text-xs text-subtle">
        Press <kbd className="kbd">G</kbd> then a letter within a second to jump to a section.
      </p>
    </Modal>
  );
}
