import { useState } from "react";
import { stepErrors, withoutErrors, type FormErrors, type MonitorFormValues, type StepKey } from "@/lib/monitorForm";

export function useMonitorForm(initialValues: MonitorFormValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  function update(patch: Partial<MonitorFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
    setErrors((current) => withoutErrors(current, Object.keys(patch)));
  }

  function validate(steps: StepKey[]) {
    const results = steps.map((step) => ({ step, errors: stepErrors(step, values) }));
    setErrors(Object.assign({}, ...results.map((result) => result.errors)));
    return results.find((result) => Object.keys(result.errors).length > 0)?.step ?? null;
  }

  function reset(nextValues: MonitorFormValues) {
    setValues(nextValues);
    setErrors({});
  }

  return { values, errors, update, validate, reset };
}
