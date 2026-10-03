import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuFileSpreadsheet, LuFileJson } from "react-icons/lu";
import { Link, useParams, useSearchParams } from "react-router";
import { addMonitors, monitorsQuery } from "@/api/monitors";
import { ImportStep } from "@/components/monitor-import/ImportStep";
import { ImportSteps } from "@/components/monitor-import/ImportSteps";
import { MapColumnsStep } from "@/components/monitor-import/MapColumnsStep";
import { ImportReviewStep } from "@/components/monitor-import/ImportReviewStep";
import { UploadStep } from "@/components/monitor-import/UploadStep";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { fakeRequest } from "@/lib/fakeRequest";
import {
  autoMapColumns,
  buildRows,
  hasErrors,
  toMonitor,
  validateRows,
  type ColumnMapping,
  type ImportField,
  type ImportRow,
  type ParsedFile,
} from "@/lib/importMonitors";
import { paths } from "@/lib/paths";
import type { Monitor } from "@/types/monitor";
import { plural } from "@/lib/format";

type Step = "upload" | "map" | "review" | "import";

const STEP_LABELS: Record<Step, string> = {
  upload: "Upload",
  map: "Map columns",
  review: "Review",
  import: "Import",
};

export function ImportMonitorsPage() {
  const { orgSlug = "" } = useParams();
  const [, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: monitors } = useQuery(monitorsQuery(orgSlug));

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState({ total: 0, completed: 0, currentName: "", isDone: false });
  const isUnmounted = useRef(false);

  const monitorsPath = paths.monitors(orgSlug);
  const errorsById = useMemo(() => validateRows(rows, monitors ?? []), [rows, monitors]);
  const steps = (
    file?.format === "json"
      ? (["upload", "review", "import"] as const)
      : (["upload", "map", "review", "import"] as const)
  ).map((key) => ({ key, label: STEP_LABELS[key] }));

  useUnsavedChangesGuard({
    isDirty: file !== null && !progress.isDone,
    title: "Leave this import?",
    description: "The file and any fixes you made will be discarded.",
  });

  useEffect(() => {
    isUnmounted.current = false;
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  function handleParsed(parsed: ParsedFile) {
    const autoMapping = autoMapColumns(parsed.headers);
    setFile(parsed);
    setMapping(autoMapping);
    if (parsed.format === "json") {
      showReview(parsed, autoMapping);
    } else {
      setStep("map");
    }
  }

  function showReview(parsed: ParsedFile, columnMapping: ColumnMapping) {
    setRows(buildRows(parsed, columnMapping));
    setExcludedIds(new Set());
    setSearchParams({}, { replace: true });
    setStep("review");
  }

  function changeMapping(field: ImportField, header: string | null) {
    setMapping((current) => current && { ...current, [field]: header });
  }

  function fixCell(rowId: string, field: ImportField, value: string) {
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, values: { ...row.values, [field]: value.trim() } } : row)),
    );
  }

  function toggleRows(rowIds: string[], isIncluded: boolean) {
    setExcludedIds((current) => {
      const next = new Set(current);
      rowIds.forEach((id) => (isIncluded ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  function reset() {
    setFile(null);
    setMapping(null);
    setRows([]);
    setExcludedIds(new Set());
    setProgress({ total: 0, completed: 0, currentName: "", isDone: false });
    setSearchParams({}, { replace: true });
    setStep("upload");
  }

  async function discardFile() {
    const shouldDiscard = await confirm({
      title: "Choose another file?",
      description: "This file and any fixes you made will be discarded.",
      confirmLabel: "Discard file",
      isDanger: true,
    });
    if (shouldDiscard) reset();
  }

  async function runImport() {
    const selected = rows.filter((row) => !hasErrors(errorsById.get(row.id)) && !excludedIds.has(row.id));
    const imported: Monitor[] = [];
    setProgress({ total: selected.length, completed: 0, currentName: "", isDone: false });
    setStep("import");

    for (const row of selected) {
      setProgress((current) => ({ ...current, currentName: row.values.name }));
      await fakeRequest(60);
      if (isUnmounted.current) return;
      imported.push(toMonitor(row.values));
      setProgress((current) => ({ ...current, completed: imported.length }));
    }

    await queryClient.ensureQueryData(monitorsQuery(orgSlug));
    await addMonitors(queryClient, orgSlug, imported);
    setProgress((current) => ({ ...current, isDone: true }));
    toast.success(
      `${plural(imported.length, "monitor")} imported`,
      `From ${file?.fileName}. First checks run within a minute.`,
    );
  }

  return (
    <>
      <title>Import monitors · Uptrail</title>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Import monitors"
          meta="Bring monitors over from another tool with a CSV or JSON file. Nothing is created until you confirm."
          actions={
            <Link to={monitorsPath} className="text-muted hover:text-ink">
              Cancel
            </Link>
          }
        />

        <section aria-label="Import monitors" className="flex flex-col rounded-lg border border-line bg-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <ImportSteps steps={steps} current={step} />
            {file && <FileChip file={file} />}
          </header>

          {step === "upload" && <UploadStep onParsed={handleParsed} />}

          {step === "map" && file && mapping && (
            <MapColumnsStep
              file={file}
              mapping={mapping}
              onChange={changeMapping}
              onBack={discardFile}
              onContinue={() => showReview(file, mapping)}
            />
          )}

          {step === "review" && file && (
            <ImportReviewStep
              rows={rows}
              errorsById={errorsById}
              excludedIds={excludedIds}
              backLabel={file.format === "csv" ? "Back to mapping" : "Choose another file"}
              onFix={fixCell}
              onToggleRows={toggleRows}
              onBack={() => (file.format === "csv" ? setStep("map") : discardFile())}
              onImport={runImport}
            />
          )}

          {step === "import" && (
            <ImportStep
              total={progress.total}
              completed={progress.completed}
              currentName={progress.currentName}
              skipped={rows.length - progress.total}
              isDone={progress.isDone}
              monitorsPath={monitorsPath}
              onImportAnother={reset}
            />
          )}
        </section>
      </div>
    </>
  );
}

function FileChip({ file }: { file: ParsedFile }) {
  const Icon = file.format === "json" ? LuFileJson : LuFileSpreadsheet;
  return (
    <MetaList className="min-w-0 text-xs text-muted">
      <span className="flex min-w-0 items-center gap-2">
        <Icon aria-hidden className="size-3.5 shrink-0 text-subtle" />
        <span className="truncate font-mono text-ink">{file.fileName}</span>
      </span>
      <span className="shrink-0 font-mono">{file.records.length} rows</span>
    </MetaList>
  );
}
