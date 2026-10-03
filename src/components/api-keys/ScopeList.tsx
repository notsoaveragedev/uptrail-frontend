import { Popover } from "antd";

export function ScopeList({ permissions }: { permissions: string[] }) {
  const [first, ...rest] = permissions;

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate rounded-sm bg-hover px-1.5 font-mono text-xs text-ink">{first}</span>
      {rest.length > 0 && (
        <Popover
          trigger={["hover", "focus"]}
          content={
            <ul className="flex max-w-72 flex-wrap gap-1">
              {permissions.map((permission) => (
                <li key={permission} className="rounded-sm bg-hover px-1.5 font-mono text-xs">
                  {permission}
                </li>
              ))}
            </ul>
          }
        >
          <button type="button" className="shrink-0 cursor-default font-mono text-xs text-subtle hover:text-ink">
            +{rest.length}
          </button>
        </Popover>
      )}
    </span>
  );
}
