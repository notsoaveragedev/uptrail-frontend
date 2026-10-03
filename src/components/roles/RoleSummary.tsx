import { LuCheck, LuMinus } from "react-icons/lu";
import { Card } from "@/components/ui/Card";
import { ALL_PERMISSIONS, PERMISSION_RESOURCES, permissionSummary } from "@/lib/permissions";

export function RoleSummary({ selected }: { selected: Set<string> }) {
  const granted = permissionSummary(selected);
  const missing = PERMISSION_RESOURCES.filter((resource) => !granted.some((item) => item.resource === resource.label));

  return (
    <Card title="What this role can do" meta={`${selected.size} of ${ALL_PERMISSIONS.length}`}>
      <div className="flex flex-col gap-4 px-4 pb-4">
        {granted.length === 0 ? (
          <p className="text-muted">Nothing yet. Tick permissions in the matrix to grant access.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {granted.map((item) => (
              <li key={item.resource} className="flex gap-2">
                <LuCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-up" />
                <span>
                  <span className="font-medium text-ink">{item.resource}</span>
                  <span className="text-muted"> · {item.text}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {missing.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-line pt-3">
            <span className="text-caps font-semibold tracking-widest text-subtle uppercase">No access</span>
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {missing.map((resource) => (
                <li key={resource.key} className="flex items-center gap-1 text-muted">
                  <LuMinus aria-hidden className="size-3 text-faint" />
                  {resource.label}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-subtle">
          Applies org-wide. Project overrides on a member can replace it per project.
        </p>
      </div>
    </Card>
  );
}
