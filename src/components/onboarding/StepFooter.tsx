import { Button } from "antd";

type StepFooterProps = {
  continueLabel: string;
  isPending?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
};

export function StepFooter({ continueLabel, isPending = false, onBack, onSkip }: StepFooterProps) {
  return (
    <div className="mt-8 flex items-center gap-2">
      {onBack && (
        <Button type="text" disabled={isPending} onClick={onBack}>
          Back
        </Button>
      )}
      <div className="ml-auto flex items-center gap-2">
        {onSkip && (
          <Button disabled={isPending} onClick={onSkip}>
            Skip
          </Button>
        )}
        <Button type="primary" htmlType="submit" loading={isPending}>
          {continueLabel}
          <kbd className="kbd border-on-accent/30 bg-transparent text-on-accent">↵</kbd>
        </Button>
      </div>
    </div>
  );
}
