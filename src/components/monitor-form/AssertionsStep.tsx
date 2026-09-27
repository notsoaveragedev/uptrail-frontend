import { Segmented } from "antd";
import { useId } from "react";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { JSON_OPERATORS, type MonitorFieldProps, type MonitorFormValues } from "@/lib/monitorForm";

export function AssertionsStep(props: MonitorFieldProps) {
  const { type } = props.values;

  return (
    <div className="flex flex-col gap-6">
      {type === "ssl" ? <SslFields {...props} /> : <ExpectedStatusField {...props} />}
      {type === "keyword" && <KeywordFields {...props} />}
      {type === "json" && <JsonFields {...props} />}
      {type === "response_time" && <LatencyField {...props} />}
    </div>
  );
}

function ExpectedStatusField({ values, errors, onChange }: MonitorFieldProps) {
  return (
    <CustomInput
      label="Expected status codes"
      value={values.expectedStatus}
      onChange={(event) => onChange({ expectedStatus: event.target.value })}
      placeholder="200-299"
      className="font-mono"
      error={errors.expectedStatus}
      hint="Codes or ranges, separated by commas. For example 200-299, 301."
    />
  );
}

function KeywordFields({ values, errors, onChange }: MonitorFieldProps) {
  const modeLabelId = useId();

  return (
    <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <CustomInput
        label="Keyword"
        value={values.keyword}
        onChange={(event) => onChange({ keyword: event.target.value })}
        placeholder="Get started"
        error={errors.keyword}
        hint="Case-sensitive match against the response body."
      />
      <FieldShell label="The keyword must be" labelId={modeLabelId}>
        <Segmented<MonitorFormValues["keywordMode"]>
          aria-labelledby={modeLabelId}
          size="large"
          value={values.keywordMode}
          onChange={(keywordMode) => onChange({ keywordMode })}
          options={[
            { value: "present", label: "Present" },
            { value: "absent", label: "Absent" },
          ]}
        />
      </FieldShell>
    </div>
  );
}

function JsonFields({ values, errors, onChange }: MonitorFieldProps) {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <CustomInput
        label="JSON path"
        value={values.jsonPath}
        onChange={(event) => onChange({ jsonPath: event.target.value })}
        placeholder="$.status"
        spellCheck={false}
        className="font-mono"
        error={errors.jsonPath}
      />
      <CustomSelect
        label="Operator"
        value={values.jsonOperator}
        onChange={(jsonOperator) => onChange({ jsonOperator })}
        options={JSON_OPERATORS.map(({ value, label }) => ({ value, label }))}
      />
      <CustomInput
        label="Expected value"
        value={values.jsonValue}
        onChange={(event) => onChange({ jsonValue: event.target.value })}
        placeholder={'"ok"'}
        spellCheck={false}
        className="font-mono"
        error={errors.jsonValue}
      />
    </div>
  );
}

function LatencyField({ values, errors, onChange }: MonitorFieldProps) {
  return (
    <CustomInput
      label="Max response time"
      value={values.maxLatencyMs}
      onChange={(event) => onChange({ maxLatencyMs: event.target.value })}
      inputMode="numeric"
      suffix={<span className="text-xs text-muted">ms</span>}
      className="max-w-50"
      classNames={{ input: "font-mono" }}
      error={errors.maxLatencyMs}
      hint="Checks slower than this mark the monitor as degraded."
    />
  );
}

function SslFields({ values, errors, onChange }: MonitorFieldProps) {
  return (
    <CustomInput
      label="Warn before expiry"
      value={values.sslWarnDays}
      onChange={(event) => onChange({ sslWarnDays: event.target.value })}
      inputMode="numeric"
      suffix={<span className="text-xs text-muted">days</span>}
      className="max-w-50"
      classNames={{ input: "font-mono" }}
      error={errors.sslWarnDays}
      hint="An invalid or expired certificate always fails the check."
    />
  );
}
