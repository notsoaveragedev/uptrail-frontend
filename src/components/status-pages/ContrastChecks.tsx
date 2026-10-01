import { Button } from "antd";
import { TONE_BADGE } from "@/lib/status";
import { contrastChecks, contrastLevel, formatRatio } from "@/lib/statusPages";
import type { StatusTheme } from "@/types/statusPage";

type ContrastChecksProps = {
  theme: StatusTheme;
  onFix: (patch: Partial<StatusTheme>) => void;
};

export function ContrastChecks({ theme, onFix }: ContrastChecksProps) {
  return (
    <ul aria-label="Contrast checks" className="flex flex-col divide-y divide-line rounded-md border border-line">
      {contrastChecks(theme).map((check) => {
        const level = contrastLevel(check.ratio);
        return (
          <li key={check.key} className="flex flex-col gap-1.5 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">{check.label}</span>
              <span className={`rounded-sm px-1.5 font-mono text-xs font-medium ${TONE_BADGE[level.tone]}`}>
                {level.label} {formatRatio(check.ratio)}
              </span>
            </div>
            {check.isFailing && (
              <div role="alert" className="flex flex-col items-start gap-1 text-xs">
                <span className="text-down">Below {check.min}:1, so visitors see the default colours.</span>
                <Button
                  size="small"
                  type="link"
                  onClick={() => onFix({ [check.key]: check.suggestion })}
                  className="h-auto p-0"
                >
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="size-2.5 rounded-xs" style={{ backgroundColor: check.suggestion }} />
                    Use suggested <span className="font-mono">{check.suggestion}</span>
                  </span>
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
