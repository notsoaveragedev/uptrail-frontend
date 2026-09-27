import { Switch } from "antd";
import { useId } from "react";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { MAX_TIMEOUT_MS, methodHasBody, type MonitorFieldProps } from "@/lib/monitorForm";
import { HTTP_METHODS } from "@/lib/monitors";
import { BodyEditor } from "./BodyEditor";
import { HeadersEditor } from "./HeadersEditor";

export function RequestStep({ values, errors, onChange }: MonitorFieldProps) {
  const urlId = useId();
  const redirectsId = useId();

  return (
    <div className="flex flex-col gap-6">
      <CustomInput
        label="Monitor name"
        value={values.name}
        onChange={(event) => onChange({ name: event.target.value })}
        placeholder="Checkout API"
        error={errors.name}
        autoComplete="off"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={urlId} className="font-medium text-ink">
          Request URL
        </label>
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-2">
          <CustomSelect
            aria-label="HTTP method"
            value={values.method}
            onChange={(method) => onChange({ method })}
            options={HTTP_METHODS.map((method) => ({ value: method, label: method }))}
            className="w-full font-mono"
            popupMatchSelectWidth={false}
          />
          <CustomInput
            id={urlId}
            value={values.url}
            onChange={(event) => onChange({ url: event.target.value })}
            placeholder="https://api.example.com/health"
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-sm"
            error={errors.url}
            hint={errors.url ? undefined : "Include the full path and query string."}
          />
        </div>
      </div>

      <HeadersEditor values={values} errors={errors} onChange={onChange} />

      {methodHasBody(values.method) && <BodyEditor values={values} errors={errors} onChange={onChange} />}

      <div className="grid items-start gap-6 sm:grid-cols-[12.5rem_minmax(0,1fr)]">
        <CustomInput
          label="Timeout"
          value={values.timeoutMs}
          onChange={(event) => onChange({ timeoutMs: event.target.value })}
          inputMode="numeric"
          suffix={<span className="text-xs text-muted">ms</span>}
          classNames={{ input: "font-mono" }}
          error={errors.timeoutMs}
          hint={errors.timeoutMs ? undefined : `Max ${MAX_TIMEOUT_MS.toLocaleString()} ms`}
        />
        <div className="flex items-start gap-3 sm:pt-7">
          <Switch
            id={redirectsId}
            checked={values.followRedirects}
            onChange={(followRedirects) => onChange({ followRedirects })}
            aria-describedby={`${redirectsId}-hint`}
          />
          <div className="flex flex-col">
            <label htmlFor={redirectsId} className="cursor-pointer font-medium text-ink">
              Follow redirects
            </label>
            <span id={`${redirectsId}-hint`} className="text-xs text-muted">
              Up to 5 hops; the final response is evaluated.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
