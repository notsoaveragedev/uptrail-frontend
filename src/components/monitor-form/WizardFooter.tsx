import { Button } from "antd";
import { LuArrowLeft, LuArrowRight, LuCheck } from "react-icons/lu";
import { STEPS } from "@/lib/monitorForm";

type WizardFooterProps = {
  step: number;
  isCreating: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
};

export function WizardFooter({ step, isCreating, onBack, onSaveDraft, onNext }: WizardFooterProps) {
  const isLast = step === STEPS.length - 1;

  return (
    <footer className="flex items-center gap-2 border-t border-line px-5 py-3.5">
      {step > 0 && (
        <Button type="text" icon={<LuArrowLeft />} onClick={onBack} className="text-muted">
          Back
        </Button>
      )}
      <span className="flex-1" />
      <Button onClick={onSaveDraft}>Save draft</Button>
      <Button
        type="primary"
        icon={isLast ? <LuCheck /> : <LuArrowRight />}
        iconPlacement={isLast ? "start" : "end"}
        loading={isCreating}
        onClick={onNext}
      >
        {isLast ? "Create monitor" : `Next: ${STEPS[step + 1].label}`}
      </Button>
    </footer>
  );
}
