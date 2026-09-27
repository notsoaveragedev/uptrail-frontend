import { Dropdown } from "antd";
import { LuCheck, LuChevronsUpDown, LuPlus } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { paths } from "@/lib/paths";
import { organizations } from "@/mocks/workspace";

export function OrgSwitcher() {
  const navigate = useNavigate();
  const { orgSlug } = useParams();
  const current = organizations.find((org) => org.slug === orgSlug) ?? organizations[0];

  const items = [
    ...organizations.map((org) => ({
      key: org.slug,
      label: (
        <span className="flex items-center gap-2.5">
          <OrgTile initials={org.initials} />
          <span className="flex-1">{org.name}</span>
          {org.slug === current.slug && <LuCheck className="size-4 text-muted" />}
        </span>
      ),
    })),
    { type: "divider" as const },
    { key: "new", icon: <LuPlus />, label: "Create organization" },
  ];

  return (
    <Dropdown
      trigger={["click"]}
      menu={{ items, onClick: ({ key }) => key !== "new" && navigate(paths.overview(key)) }}
      popupRender={(menu) => <div className="w-56">{menu}</div>}
    >
      <button
        type="button"
        aria-label={`Switch organization, current: ${current.name}`}
        className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-md border border-line bg-card px-2.5 text-left hover:border-line-strong"
      >
        <OrgTile initials={current.initials} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold">{current.name}</span>
          <span className="text-xs text-subtle">{current.role}</span>
        </span>
        <LuChevronsUpDown className="size-4 text-subtle" />
      </button>
    </Dropdown>
  );
}

function OrgTile({ initials }: { initials: string }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent text-caps font-bold text-on-accent">
      {initials}
    </span>
  );
}
