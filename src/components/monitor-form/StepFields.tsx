import type { MonitorFieldProps, StepKey } from "@/lib/monitorForm";
import { AlertsStep } from "./AlertsStep";
import { AssertionsStep } from "./AssertionsStep";
import { RequestStep } from "./RequestStep";
import { ScheduleStep } from "./ScheduleStep";
import { TypeStep } from "./TypeStep";

type StepFieldsProps = MonitorFieldProps & { step: Exclude<StepKey, "review"> };

export function StepFields({ step, ...props }: StepFieldsProps) {
  if (step === "type") return <TypeStep {...props} />;
  if (step === "request") return <RequestStep {...props} />;
  if (step === "assertions") return <AssertionsStep {...props} />;
  if (step === "schedule") return <ScheduleStep {...props} />;
  return <AlertsStep {...props} />;
}
