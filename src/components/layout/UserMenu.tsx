import { Dropdown } from "antd";
import { LuCircleUser, LuEllipsisVertical, LuKeyboard, LuLogOut } from "react-icons/lu";
import { useNavigate } from "react-router";
import { useLogOut } from "@/hooks/useLogOut";
import { paths } from "@/lib/paths";
import { currentUser } from "@/mocks/workspace";

export function UserMenu({ onShowShortcuts }: { onShowShortcuts: () => void }) {
  const navigate = useNavigate();
  const logOut = useLogOut();

  const items = [
    { key: "account", icon: <LuCircleUser />, label: "Account settings", onClick: () => navigate(paths.account()) },
    {
      key: "shortcuts",
      icon: <LuKeyboard />,
      label: (
        <span className="flex items-center justify-between">
          Keyboard shortcuts <kbd className="kbd">?</kbd>
        </span>
      ),
      onClick: onShowShortcuts,
    },
    { type: "divider" as const },
    { key: "logout", icon: <LuLogOut />, label: "Log out", danger: true },
  ];

  return (
    <Dropdown
      trigger={["click"]}
      placement="topLeft"
      menu={{ items, onClick: ({ key }) => key === "logout" && logOut() }}
      popupRender={(menu) => <div className="w-52">{menu}</div>}
    >
      <button
        type="button"
        aria-label="Account menu"
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-md p-2 text-left hover:bg-hover"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-hover text-xs font-semibold">
          {currentUser.initials}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{currentUser.name}</span>
          <span className="truncate text-xs text-subtle">{currentUser.email}</span>
        </span>
        <LuEllipsisVertical className="size-4 text-subtle" />
      </button>
    </Dropdown>
  );
}
