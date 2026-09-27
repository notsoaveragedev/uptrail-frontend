import { Dropdown } from "antd";
import { LuCircleUser, LuEllipsisVertical, LuKeyboard, LuLogOut } from "react-icons/lu";
import { useNavigate } from "react-router";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { currentUser } from "@/mocks/workspace";

export function UserMenu() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  async function logOut() {
    const isConfirmed = await confirm({
      title: "Log out of Uptrail?",
      description: "You'll need to sign in again to see your monitors.",
      confirmLabel: "Log out",
    });
    if (!isConfirmed) return;
    navigate("/login");
    toast.info("You're signed out", "See you soon.");
  }

  const items = [
    { key: "account", icon: <LuCircleUser />, label: "Account settings" },
    { key: "shortcuts", icon: <LuKeyboard />, label: "Keyboard shortcuts" },
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
