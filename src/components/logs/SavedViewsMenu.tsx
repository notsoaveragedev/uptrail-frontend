import { Button, Dropdown, Modal } from "antd";
import { useState } from "react";
import { LuBookmark, LuTrash2 } from "react-icons/lu";
import { CustomInput } from "@/components/ui/CustomInput";
import { useConfirm } from "@/hooks/useConfirm";
import { useForm } from "@/hooks/useForm";
import { useLogsFilters } from "@/hooks/useLogsFilters";
import { useStoredState } from "@/hooks/useStoredState";
import { useToast } from "@/hooks/useToast";
import { BUILT_IN_VIEWS, normalizeSearch, viewSearch, type SavedView } from "@/lib/savedViews";
import { savedViewSchema } from "@/lib/schemas";
import type { ColumnState } from "@/types/dataGrid";

type SavedViewsMenuProps = {
  columnState: ColumnState;
  onColumnStateChange: (state: ColumnState) => void;
};

export function SavedViewsMenu({ columnState, onColumnStateChange }: SavedViewsMenuProps) {
  const toast = useToast();
  const confirm = useConfirm();
  const { searchParams, setSearchParams } = useLogsFilters();
  const [views, setViews] = useStoredState<SavedView[]>("uptrail:logs-views", []);
  const [isSaving, setIsSaving] = useState(false);
  const current = viewSearch(searchParams);
  const activeView = [...BUILT_IN_VIEWS, ...views].find((view) => normalizeSearch(view.search) === current);

  const { formProps, fieldErrors } = useForm({
    schema: savedViewSchema,
    onSubmit: async ({ name }) => {
      setViews([...views, { id: crypto.randomUUID(), name, search: current, columnState }]);
      setIsSaving(false);
      toast.success("View saved", `${name} keeps these filters, sort and columns.`);
    },
  });

  function apply(view: SavedView) {
    setSearchParams(new URLSearchParams(view.search));
    if (view.columnState) onColumnStateChange(view.columnState);
  }

  async function remove(view: SavedView) {
    const isConfirmed = await confirm({ title: `Delete "${view.name}"?`, confirmLabel: "Delete view", isDanger: true });
    if (!isConfirmed) return;
    const previous = views;
    setViews(views.filter((item) => item.id !== view.id));
    toast.success("View deleted", view.name, { label: "Undo", onClick: () => setViews(previous) });
  }

  const viewItem = (view: SavedView, isRemovable: boolean) => ({
    key: view.id,
    label: (
      <span className="group flex items-center justify-between gap-3">
        <span className={activeView?.id === view.id ? "font-medium text-ink" : ""}>{view.name}</span>
        {isRemovable && (
          <button
            type="button"
            aria-label={`Delete ${view.name}`}
            onClick={(event) => {
              event.stopPropagation();
              remove(view);
            }}
            className="cursor-pointer text-subtle opacity-0 group-hover:opacity-100 hover:text-down"
          >
            <LuTrash2 className="size-3.5" />
          </button>
        )}
      </span>
    ),
  });

  const items = [
    {
      type: "group" as const,
      key: "built-in",
      label: "Views",
      children: BUILT_IN_VIEWS.map((view) => viewItem(view, false)),
    },
    ...(views.length > 0
      ? [
          {
            type: "group" as const,
            key: "mine",
            label: "My views",
            children: views.map((view) => viewItem(view, true)),
          },
        ]
      : []),
    { type: "divider" as const },
    { key: "__save", label: "Save current view…" },
  ];

  return (
    <>
      <Dropdown
        trigger={["click"]}
        menu={{
          items,
          onClick: ({ key }) => {
            if (key === "__save") return setIsSaving(true);
            const view = [...BUILT_IN_VIEWS, ...views].find((item) => item.id === key);
            if (view) apply(view);
          },
        }}
        popupRender={(menu) => <div className="w-60">{menu}</div>}
      >
        <Button icon={<LuBookmark />}>
          {activeView ? (
            <>
              View: <span className="text-ink">{activeView.name}</span>
            </>
          ) : (
            "Saved views"
          )}
        </Button>
      </Dropdown>

      <Modal
        open={isSaving}
        onCancel={() => setIsSaving(false)}
        title="Save view"
        footer={null}
        destroyOnHidden
        width="26rem"
      >
        <form {...formProps} className="flex flex-col gap-4 pt-2">
          <CustomInput label="Name" name="name" placeholder="Checkout failures" autoFocus error={fieldErrors.name} />
          <p className="text-xs text-subtle">
            Saves the current filters, time range, sort, grouping and column layout.
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsSaving(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save view
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
