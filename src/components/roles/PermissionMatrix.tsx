import { Checkbox, Tooltip } from "antd";
import { LuLink } from "react-icons/lu";
import {
  columnState,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  requiredBy,
  rowState,
  toggleColumn,
  togglePermission,
  toggleRow,
} from "@/lib/permissions";
import type { PermissionResource } from "@/types/rbac";

type PermissionMatrixProps = {
  selected: Set<string>;
  onChange: (next: Set<string>, note: string | null) => void;
  baseline?: Set<string>;
  allowed?: Set<string>;
  isReadOnly?: boolean;
  isCompact?: boolean;
};

export function PermissionMatrix({
  selected,
  onChange,
  baseline,
  allowed,
  isReadOnly = false,
  isCompact = false,
}: PermissionMatrixProps) {
  function commit(next: Set<string>, note: string | null = null) {
    onChange(limit(next), note);
  }

  function toggleCell(resource: PermissionResource, permission: string, actionLabel: string) {
    const read = requiredBy(permission);
    const isAddingRead = read !== null && !selected.has(permission) && !selected.has(read);
    commit(
      togglePermission(selected, permission),
      isAddingRead ? `Read ${resource.label.toLowerCase()} was turned on too: ${actionLabel} needs it.` : null,
    );
  }

  function limit(next: Set<string>) {
    return allowed ? new Set([...next].filter((key) => allowed.has(key))) : next;
  }

  function dependentsOf(resource: PermissionResource) {
    return Object.values(resource.actions).filter((key) => requiredBy(key) && selected.has(key));
  }

  const cellPadding = isCompact ? "px-2 py-1.5" : "px-3 py-2.5";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-120 border-collapse">
        <caption className="sr-only">Permissions by resource and action</caption>
        <thead>
          <tr className="border-b border-line text-left">
            <th scope="col" className={`${cellPadding} text-caps font-semibold tracking-widest text-subtle uppercase`}>
              Resource
            </th>
            {PERMISSION_ACTIONS.map((action) => {
              const state = columnState(selected, action.key, allowed);
              return (
                <th key={action.key} scope="col" className={`${cellPadding} w-20 text-center`}>
                  <span className="inline-flex flex-col items-center gap-1 text-xs font-medium text-muted">
                    {action.label}
                    {!isReadOnly && (
                      <Checkbox
                        aria-label={`All ${action.label.toLowerCase()} permissions`}
                        checked={state.checked}
                        indeterminate={state.indeterminate}
                        onChange={() => commit(toggleColumn(selected, action.key, allowed))}
                      />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_RESOURCES.map((resource) => {
            const state = rowState(selected, resource, allowed);
            const total = Object.keys(resource.actions).length;
            const count = Object.values(resource.actions).filter((key) => selected.has(key)).length;
            return (
              <tr key={resource.key} className="border-b border-line last:border-b-0 hover:bg-hover/60">
                <th scope="row" className={`${cellPadding} text-left font-normal`}>
                  <span className="flex items-center gap-2.5">
                    {!isReadOnly && (
                      <Checkbox
                        aria-label={`All ${resource.label} permissions`}
                        checked={state.checked}
                        indeterminate={state.indeterminate}
                        onChange={() => commit(toggleRow(selected, resource, allowed))}
                      />
                    )}
                    <span className="font-medium text-ink">{resource.label}</span>
                    <span className="font-mono text-xs text-subtle">
                      {count}/{total}
                    </span>
                  </span>
                </th>
                {PERMISSION_ACTIONS.map((action) => {
                  const permission = resource.actions[action.key];
                  if (!permission) {
                    return (
                      <td key={action.key} aria-hidden className={`${cellPadding} bg-panel/60 text-center text-faint`}>
                        —
                      </td>
                    );
                  }
                  const isChecked = selected.has(permission);
                  const isChanged = baseline !== undefined && baseline.has(permission) !== isChecked;
                  const isLockedRead = isChecked && !requiredBy(permission) && dependentsOf(resource).length > 0;
                  const isOutOfReach = allowed !== undefined && !allowed.has(permission);
                  const tooltip = isOutOfReach
                    ? `Your role doesn't have ${permission}`
                    : isLockedRead
                      ? `Required while other ${resource.label.toLowerCase()} permissions are on`
                      : permission;
                  return (
                    <td key={action.key} className={`${cellPadding} relative text-center`}>
                      <Tooltip title={<span className="font-mono">{tooltip}</span>} mouseEnterDelay={0.4}>
                        <span className="inline-flex items-center gap-1">
                          <Checkbox
                            aria-label={`${action.label} ${resource.label}`}
                            checked={isChecked}
                            disabled={isReadOnly || isOutOfReach || isLockedRead}
                            onChange={() => toggleCell(resource, permission, action.label)}
                          />
                          {isLockedRead && !isReadOnly && <LuLink aria-hidden className="size-3 text-subtle" />}
                        </span>
                      </Tooltip>
                      {isChanged && (
                        <span aria-hidden className="absolute top-1.5 right-2 size-1.5 rounded-full bg-degraded" />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
