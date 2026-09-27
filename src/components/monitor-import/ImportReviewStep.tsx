import { Button, Segmented, Table, type TableColumnsType } from "antd";
import { LuArrowLeft, LuCircleAlert, LuCircleCheck } from "react-icons/lu";
import { MetaList } from "@/components/ui/MetaList";
import { useSearchParam } from "@/hooks/useSearchParam";
import { hasErrors, IMPORT_FIELDS, type ImportField, type ImportRow, type RowErrors } from "@/lib/importMonitors";
import { ImportCell } from "./ImportCell";
import { StepFooter } from "./StepFooter";

const FILTERS = ["all", "valid", "errors"] as const;
type Filter = (typeof FILTERS)[number];

const COLUMN_WIDTHS: Record<ImportField, number> = {
  name: 190,
  url: 260,
  type: 110,
  method: 100,
  interval: 100,
  regions: 140,
  project: 120,
  tags: 170,
  expected_status: 130,
};

const MONO_FIELDS: ImportField[] = ["url", "method", "interval", "regions", "expected_status"];

type ImportReviewStepProps = {
  rows: ImportRow[];
  errorsById: Map<string, RowErrors>;
  excludedIds: Set<string>;
  backLabel: string;
  onFix: (rowId: string, field: ImportField, value: string) => void;
  onToggleRows: (rowIds: string[], isIncluded: boolean) => void;
  onBack: () => void;
  onImport: () => void;
};

export function ImportReviewStep({
  rows,
  errorsById,
  excludedIds,
  backLabel,
  onFix,
  onToggleRows,
  onBack,
  onImport,
}: ImportReviewStepProps) {
  const [filter, setFilter] = useSearchParam("show", FILTERS, "all", { replace: true });

  const isValid = (row: ImportRow) => !hasErrors(errorsById.get(row.id));
  const validRows = rows.filter(isValid);
  const excludedCount = validRows.filter((row) => excludedIds.has(row.id)).length;
  const importCount = validRows.length - excludedCount;
  const errorCount = rows.length - validRows.length;
  const counts: Record<Filter, number> = { all: rows.length, valid: validRows.length, errors: errorCount };
  const visibleRows = rows.filter((row) => filter === "all" || (filter === "valid") === isValid(row));

  const columns: TableColumnsType<ImportRow> = [
    {
      title: "Row",
      key: "line",
      width: 64,
      fixed: "left",
      render: (_, row) => <span className="font-mono text-xs text-subtle">{row.line}</span>,
    },
    ...IMPORT_FIELDS.map((field) => ({
      title: field.label,
      key: field.key,
      width: COLUMN_WIDTHS[field.key],
      render: (_: unknown, row: ImportRow) => (
        <ImportCell
          label={field.label}
          line={row.line}
          value={row.values[field.key]}
          error={errorsById.get(row.id)?.[field.key]}
          isMono={MONO_FIELDS.includes(field.key)}
          onFix={(value) => onFix(row.id, field.key, value)}
        />
      ),
    })),
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-3">
        <MetaList aria-live="polite" className="text-muted">
          <span className="flex items-center gap-1.5">
            <LuCircleCheck aria-hidden className="size-3.5 text-up" />
            <span className="font-mono text-up">{validRows.length}</span> valid
          </span>
          <span className="flex items-center gap-1.5">
            <LuCircleAlert aria-hidden className="size-3.5 text-down" />
            <span className="font-mono text-down">{errorCount}</span> with errors
          </span>
          <span>
            <span className="font-mono text-ink">{excludedCount}</span> excluded
          </span>
        </MetaList>

        <Segmented
          aria-label="Show rows"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((value) => ({
            value,
            label: (
              <span className="flex items-center gap-1.5">
                {value === "all" ? "All" : value === "valid" ? "Valid" : "Errors"}
                <span className="font-mono text-xs text-subtle">{counts[value]}</span>
              </span>
            ),
          }))}
        />
      </div>

      {errorCount > 0 && (
        <p className="px-5 pb-3 text-xs text-subtle">
          Rows with errors are skipped. Click a highlighted cell to fix it.
        </p>
      )}

      <Table
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={visibleRows}
        scroll={{ x: 1400 }}
        pagination={{ pageSize: 25, hideOnSinglePage: true, showSizeChanger: false }}
        rowClassName={(row) => (isValid(row) ? "" : "[&>td]:bg-down-soft/30")}
        rowSelection={{
          fixed: true,
          selectedRowKeys: validRows.filter((row) => !excludedIds.has(row.id)).map((row) => row.id),
          getCheckboxProps: (row) => ({
            disabled: !isValid(row),
            "aria-label": isValid(row) ? `Include row ${row.line}` : `Row ${row.line} has errors and will be skipped`,
          }),
          onSelect: (row, isSelected) => onToggleRows([row.id], isSelected),
          onSelectAll: (isSelected, _selected, changedRows) =>
            onToggleRows(
              changedRows.filter(isValid).map((row) => row.id),
              isSelected,
            ),
        }}
        locale={{ emptyText: <span className="block py-8 text-muted">No rows match this filter.</span> }}
        className="border-t border-line"
      />

      <StepFooter
        start={
          <Button type="text" icon={<LuArrowLeft />} onClick={onBack}>
            {backLabel}
          </Button>
        }
      >
        <span className="text-xs text-subtle">
          {rows.length - importCount} of {rows.length} rows will be skipped
        </span>
        <Button type="primary" disabled={importCount === 0} onClick={onImport}>
          Import {importCount} {importCount === 1 ? "monitor" : "monitors"}
        </Button>
      </StepFooter>
    </>
  );
}
