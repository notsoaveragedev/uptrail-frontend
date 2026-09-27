import { Alert, Button } from "antd";
import { useId } from "react";
import { LuArrowLeft, LuArrowRight, LuMoveRight } from "react-icons/lu";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  IMPORT_FIELDS,
  missingRequiredFields,
  type ColumnMapping,
  type ImportField,
  type ParsedFile,
} from "@/lib/importMonitors";
import { StepFooter } from "./StepFooter";

const SKIP = "__skip__";

type MapColumnsStepProps = {
  file: ParsedFile;
  mapping: ColumnMapping;
  onChange: (field: ImportField, header: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function MapColumnsStep({ file, mapping, onChange, onBack, onContinue }: MapColumnsStepProps) {
  const idPrefix = useId();
  const missing = missingRequiredFields(mapping);
  const firstRecord = file.records[0] ?? {};
  const headerOptions = [
    { value: SKIP, label: <span className="text-subtle">Don't import</span> },
    ...file.headers.map((header) => ({ value: header, label: <span className="font-mono text-xs">{header}</span> })),
  ];

  return (
    <>
      <div className="flex flex-col gap-4 p-5">
        <p className="text-muted">
          We matched the columns we recognised. Check each field, then continue to review{" "}
          <span className="font-mono text-ink">{file.records.length}</span> rows.
        </p>

        <div role="table" aria-label="Column mapping" className="overflow-hidden rounded-lg border border-line">
          <div
            role="row"
            className="grid grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 border-b border-line bg-panel px-4 py-2 text-caps font-semibold tracking-wider text-subtle uppercase"
          >
            <span role="columnheader">Uptrail field</span>
            <span aria-hidden />
            <span role="columnheader">Column in your file</span>
            <span role="columnheader">First row</span>
          </div>

          {IMPORT_FIELDS.map((field) => {
            const header = mapping[field.key];
            const isMissing = field.isRequired && !header;
            const labelId = `${idPrefix}-${field.key}`;
            return (
              <div
                role="row"
                key={field.key}
                className="grid grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 border-b border-line px-4 py-2 last:border-b-0"
              >
                <span role="cell" id={labelId} className="flex items-center gap-2">
                  <span className="font-medium">{field.label}</span>
                  {field.isRequired && (
                    <span className="text-caps font-semibold tracking-wider text-subtle uppercase">Required</span>
                  )}
                </span>
                <LuMoveRight aria-hidden className="size-4 text-subtle" />
                <span role="cell">
                  <CustomSelect
                    size="middle"
                    aria-labelledby={labelId}
                    value={header ?? SKIP}
                    options={headerOptions}
                    error={isMissing ? `Map a column to ${field.label.toLowerCase()}` : null}
                    onChange={(value) => onChange(field.key, value === SKIP ? null : value)}
                  />
                </span>
                <span role="cell" className="truncate font-mono text-xs text-subtle">
                  {header ? firstRecord[header] || "—" : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {missing.length > 0 && (
          <Alert
            type="warning"
            showIcon
            title={`Map ${missing.map((field) => field.label).join(" and ")} to continue`}
            description="Every monitor needs a name and a URL."
          />
        )}
      </div>

      <StepFooter
        start={
          <Button type="text" icon={<LuArrowLeft />} onClick={onBack}>
            Choose another file
          </Button>
        }
      >
        <Button type="primary" disabled={missing.length > 0} onClick={onContinue}>
          Review rows
          <LuArrowRight aria-hidden />
        </Button>
      </StepFooter>
    </>
  );
}
