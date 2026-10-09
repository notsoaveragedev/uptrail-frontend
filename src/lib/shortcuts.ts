import { ALL_NAV_ITEMS, canSeeNavItem } from "./navigation";

export const GO_TO_WINDOW_MS = 1200;

export type Shortcut = { keys: string[]; label: string };

export function goToTarget(key: string, granted: Set<string>) {
  return ALL_NAV_ITEMS.find((item) => item.shortcut === key && canSeeNavItem(item, granted));
}

export function shortcutGroups(granted: Set<string>): { title: string; shortcuts: Shortcut[] }[] {
  const goTo = ALL_NAV_ITEMS.flatMap((item) =>
    item.shortcut && canSeeNavItem(item, granted)
      ? [{ keys: ["G", item.shortcut.toUpperCase()], label: item.label }]
      : [],
  );

  return [
    {
      title: "General",
      shortcuts: [
        { keys: ["⌘", "K"], label: "Search and run commands" },
        { keys: ["/"], label: "Search" },
        ...(granted.has("monitor:create") ? [{ keys: ["C"], label: "Create monitor" }] : []),
        { keys: ["?"], label: "Show keyboard shortcuts" },
      ],
    },
    {
      title: "Editors",
      shortcuts: [
        { keys: ["⌘", "S"], label: "Save alert rule or status page" },
        { keys: ["⌘", "Z"], label: "Undo a dashboard change" },
        { keys: ["⌘", "↵"], label: "Post an incident update" },
        { keys: ["⌃", "Space"], label: "Suggest in rule expressions" },
      ],
    },
    {
      title: "Lists and logs",
      shortcuts: [
        { keys: ["↑", "↓"], label: "Move between log rows" },
        { keys: ["↵"], label: "Open the selected row" },
        { keys: ["Esc"], label: "Clear selection or close a panel" },
      ],
    },
    { title: "Go to", shortcuts: goTo },
  ];
}
