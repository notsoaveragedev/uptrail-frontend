import { Button, Tooltip } from "antd";
import { LuLock, LuLockOpen, LuPlus, LuTrash2 } from "react-icons/lu";
import { CustomInput } from "@/components/ui/CustomInput";
import { newHeaderRow, type HeaderRow, type MonitorFieldProps } from "@/lib/monitorForm";

const ROW_GRID = "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_2rem_2rem] items-start gap-2";

export function HeadersEditor({ values, errors, onChange }: MonitorFieldProps) {
  const headers = values.headers;

  function updateRow(id: string, patch: Partial<HeaderRow>) {
    onChange({ headers: headers.map((row) => (row.id === id ? { ...row, ...patch } : row)) });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span id="headers-label" className="font-medium text-ink">
          Headers
        </span>
        <span className="text-xs text-muted">Secret values are encrypted at rest</span>
      </div>

      {headers.length > 0 && (
        <div role="group" aria-labelledby="headers-label" className="flex flex-col gap-2">
          <div className={`${ROW_GRID} text-caps font-semibold tracking-wider text-subtle uppercase`}>
            <span>Key</span>
            <span>Value</span>
          </div>
          {headers.map((row, index) => (
            <div key={row.id} className={ROW_GRID}>
              <CustomInput
                aria-label={`Header ${index + 1} name`}
                value={row.key}
                onChange={(event) => updateRow(row.id, { key: event.target.value })}
                placeholder="Authorization"
                size="middle"
                spellCheck={false}
                autoComplete="off"
                className="font-mono text-xs"
                error={errors[`headers.${index}.key`]}
              />
              <CustomInput
                aria-label={`Header ${index + 1} value`}
                type={row.isSecret ? "password" : "text"}
                value={row.value}
                onChange={(event) => updateRow(row.id, { value: event.target.value })}
                placeholder="Bearer …"
                size="middle"
                spellCheck={false}
                autoComplete="off"
                className="font-mono text-xs"
              />
              <Tooltip title={row.isSecret ? "Secret: value is masked" : "Mark as secret"}>
                <Button
                  type="text"
                  aria-label={`Treat header ${index + 1} as secret`}
                  aria-pressed={row.isSecret}
                  icon={row.isSecret ? <LuLock className="text-ink" /> : <LuLockOpen />}
                  onClick={() => updateRow(row.id, { isSecret: !row.isSecret })}
                  className="text-muted"
                />
              </Tooltip>
              <Button
                type="text"
                aria-label={`Remove header ${index + 1}`}
                icon={<LuTrash2 />}
                onClick={() => onChange({ headers: headers.filter((header) => header.id !== row.id) })}
                className="text-muted"
              />
            </div>
          ))}
        </div>
      )}

      <Button
        type="link"
        icon={<LuPlus />}
        onClick={() => onChange({ headers: [...headers, newHeaderRow()] })}
        className="self-start px-1"
      >
        Add header
      </Button>
    </div>
  );
}
