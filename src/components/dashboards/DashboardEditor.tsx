import { lazy, Suspense, useEffect, useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { useWindowKeydown } from "@/hooks/useWindowKeydown";
import {
  addWidget,
  BREAKPOINT_OPTIONS,
  dashboardFileName,
  dashboardToJson,
  duplicateWidget,
  findWidget,
  removeWidget,
  replaceWidget,
  restoreWidget,
  simulateTeammateSave,
  withLayout,
} from "@/lib/dashboards";
import { isTypingTarget } from "@/lib/dom";
import { downloadBlob } from "@/lib/download";
import { importWithReload } from "@/lib/lazyPage";
import { createWidget } from "@/lib/widgets";
import type { Breakpoint, Dashboard, DashboardRange, DashboardWidget, WidgetType } from "@/types/dashboard";
import { ConflictModal } from "./ConflictModal";
import { DashboardHeader } from "./DashboardHeader";
import { EditableGrid } from "./EditableGrid";
import { EditToolbar } from "./EditToolbar";
import { useDashboardSave } from "./useDashboardSave";

const AddWidgetDrawer = lazy(() =>
  importWithReload(() => import("./AddWidgetDrawer")).then((module) => ({ default: module.AddWidgetDrawer })),
);

const WidgetConfigDrawer = lazy(() =>
  importWithReload(() => import("./WidgetConfigDrawer")).then((module) => ({ default: module.WidgetConfigDrawer })),
);

const FLASH_MS = 1600;

type DashboardEditorProps = {
  dashboard: Dashboard;
  range: DashboardRange;
  refreshedAt: number;
  onExit: () => void;
};

export function DashboardEditor({ dashboard, range, refreshedAt, onExit }: DashboardEditorProps) {
  const toast = useToast();
  const confirm = useConfirm();
  const history = useHistory(dashboard);
  const [base, setBase] = useState(dashboard);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("lg");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [hasOpenedConfig, setHasOpenedConfig] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [hasOpenedAdd, setHasOpenedAdd] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const draft = history.state;
  const isDirty = draft !== base;

  const { allowLeave } = useUnsavedChangesGuard({
    isDirty,
    title: "Leave without saving?",
    description: "Your dashboard edits haven't been saved and will be lost.",
  });

  function resetTo(next: Dashboard) {
    setBase(next);
    history.reset(next);
  }

  const saving = useDashboardSave({
    allowLeave,
    onSaved: (saved) => {
      resetTo(saved);
      onExit();
    },
    onDiscarded: (latest) => {
      resetTo(latest);
      onExit();
    },
  });

  useWindowKeydown((event) => {
    const isUndoKey = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z";
    if (!isUndoKey || isTypingTarget(event.target) || configId) return;
    event.preventDefault();
    if (event.shiftKey) history.redo();
    else history.undo();
  });

  useEffect(() => {
    if (!flashId) return;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .querySelector(`[data-widget-id="${flashId}"]`)
      ?.scrollIntoView({ block: "center", behavior: isReducedMotion ? "auto" : "smooth" });
    const timer = setTimeout(() => setFlashId(null), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flashId]);

  function openAdd() {
    setHasOpenedAdd(true);
    setIsAddOpen(true);
  }

  function openConfig(widgetId: string) {
    setSelectedId(widgetId);
    setConfigId(widgetId);
    setHasOpenedConfig(true);
  }

  function highlight(widgetId: string) {
    setSelectedId(widgetId);
    setFlashId(widgetId);
  }

  function handleAdd(type: WidgetType) {
    const widget = createWidget(type);
    history.set((current) => addWidget(current, widget));
    setIsAddOpen(false);
    highlight(widget.id);
  }

  function handleDuplicate(widgetId: string) {
    const result = duplicateWidget(draft, widgetId);
    if (!result) return;
    history.set(result.dashboard);
    highlight(result.widget.id);
  }

  function handleRemove(widgetId: string) {
    const result = removeWidget(draft, widgetId);
    if (!result) return;
    history.set(result.dashboard);
    if (selectedId === widgetId) setSelectedId(null);
    toast.success("Widget removed", result.removed.widget.title, {
      label: "Undo",
      onClick: () => history.set((current) => restoreWidget(current, result.removed)),
    });
  }

  function handleApply(widget: DashboardWidget) {
    history.set((current) => replaceWidget(current, widget));
    setConfigId(null);
  }

  async function handleDiscard() {
    if (!isDirty) {
      onExit();
      return;
    }
    const isConfirmed = await confirm({
      title: "Discard your changes?",
      description: "The dashboard goes back to the last saved version.",
      confirmLabel: "Discard changes",
      isDanger: true,
    });
    if (!isConfirmed) return;
    resetTo(base);
    onExit();
  }

  function handleSimulateTeammate() {
    const saved = simulateTeammateSave(dashboard.id);
    if (saved)
      toast.info(`${saved.updatedBy} saved this dashboard`, `It's on v${saved.version} now. Save to see the conflict.`);
  }

  function handleExport() {
    downloadBlob(new Blob([dashboardToJson(draft)], { type: "application/json" }), dashboardFileName(draft));
    toast.success("Export ready", `${draft.name} was saved as JSON, including unsaved edits.`);
  }

  const canvasWidth = BREAKPOINT_OPTIONS.find((option) => option.value === breakpoint)?.width;

  return (
    <div className="flex flex-col gap-4 pb-16">
      <DashboardHeader dashboard={draft} refreshedAt={refreshedAt} actions={null} />
      <EditToolbar
        changeCount={history.changeCount}
        isDirty={isDirty}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={history.undo}
        onRedo={history.redo}
        breakpoint={breakpoint}
        onBreakpointChange={setBreakpoint}
        onAddWidget={openAdd}
        onDiscard={handleDiscard}
        onSave={() => saving.save(draft)}
        isSaving={saving.isSaving}
        onExportJson={handleExport}
        onSimulateTeammate={handleSimulateTeammate}
      />
      <div
        className={`mx-auto w-full max-w-full ${breakpoint === "lg" ? "" : "rounded-xl border border-line p-3"}`}
        style={{ width: canvasWidth }}
      >
        <EditableGrid
          dashboard={draft}
          breakpoint={breakpoint}
          range={range}
          selectedId={selectedId}
          flashId={flashId}
          onLayoutChange={(target, layout) => history.set((current) => withLayout(current, target, layout))}
          onSelect={setSelectedId}
          onConfigure={openConfig}
          onDuplicate={handleDuplicate}
          onRemove={handleRemove}
          onAddWidget={openAdd}
        />
      </div>

      <Suspense fallback={null}>
        {hasOpenedAdd && <AddWidgetDrawer open={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />}
        {hasOpenedConfig && (
          <WidgetConfigDrawer
            widget={findWidget(draft, configId)}
            range={range}
            syncKey={draft.id}
            onApply={handleApply}
            onClose={() => setConfigId(null)}
          />
        )}
      </Suspense>
      <ConflictModal
        latest={saving.conflict}
        baseVersion={draft.version}
        pendingAction={saving.pendingAction}
        onOpenTheirs={saving.openTheirs}
        onSaveCopy={saving.saveCopy}
        onOverwrite={saving.overwrite}
        onClose={saving.closeConflict}
      />
    </div>
  );
}
