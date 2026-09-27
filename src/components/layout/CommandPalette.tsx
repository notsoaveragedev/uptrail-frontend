import { Input, Modal } from "antd";
import { useId, useState, type KeyboardEvent } from "react";
import { LuCornerDownLeft, LuPlus, LuSearch, LuSearchX } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { StatusIcon } from "@/components/monitors/StatusIcon";
import { ALL_NAV_ITEMS } from "@/lib/navigation";
import { buildOverview } from "@/mocks/overview";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered={false}
      width="38rem"
      style={{ top: "12vh" }}
      destroyOnHidden
      classNames={{ container: "overflow-hidden rounded-xl border border-line p-0", body: "p-0" }}
      aria-label="Search"
    >
      <PaletteContent onClose={onClose} />
    </Modal>
  );
}

function PaletteContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { orgSlug } = useParams();
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const query = search.trim().toLowerCase();

  const items = [
    {
      id: "new-monitor",
      group: "Actions",
      icon: <LuPlus />,
      title: "Create monitor",
      path: `/o/${orgSlug}/monitors/new`,
    },
    ...ALL_NAV_ITEMS.map((item) => ({
      id: `nav-${item.label}`,
      group: "Go to",
      icon: <item.icon />,
      title: item.label,
      path: item.path ? `/o/${orgSlug}/${item.path}` : `/o/${orgSlug}`,
    })),
    ...buildOverview("24h").monitors.map((monitor) => ({
      id: monitor.id,
      group: "Monitors",
      icon: <StatusIcon status={monitor.status} />,
      title: monitor.name,
      path: `/o/${orgSlug}/monitors/${monitor.id}`,
    })),
  ].filter((item) => item.title.toLowerCase().includes(query));

  function open(index: number) {
    const item = items[index];
    if (!item) return;
    navigate(item.path);
    onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") setActiveIndex((index) => Math.min(index + 1, items.length - 1));
    else if (event.key === "ArrowUp") setActiveIndex((index) => Math.max(index - 1, 0));
    else if (event.key === "Enter") open(activeIndex);
    else if (event.key === "Escape") onClose();
    else return;
    event.preventDefault();
  }

  return (
    <div>
      <div className="border-b border-line px-2 py-1.5">
        <Input
          autoFocus
          size="large"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          prefix={<LuSearch className="size-4 text-subtle" />}
          placeholder="Search monitors and pages…"
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={items[activeIndex]?.id}
        />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted">
          <LuSearchX aria-hidden className="size-5" />
          No results for “{search}”
        </div>
      ) : (
        <ul id={listId} role="listbox" aria-label="Results" className="max-h-96 overflow-y-auto p-2">
          {items.map((item, index) => (
            <li key={item.id}>
              {item.group !== items[index - 1]?.group && (
                <span className="block px-2.5 pt-2 pb-1 text-caps font-semibold tracking-widest text-subtle uppercase">
                  {item.group}
                </span>
              )}
              <div
                id={item.id}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => open(index)}
                className={`flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 [&_svg]:size-4 ${
                  index === activeIndex ? "bg-hover text-ink" : "text-muted"
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.title}</span>
                {index === activeIndex && <LuCornerDownLeft aria-hidden className="text-subtle" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
