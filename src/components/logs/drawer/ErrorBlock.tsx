import { Button } from "antd";
import { LuCopy } from "react-icons/lu";
import { useCopy } from "@/hooks/useCopy";
import type { CheckResult } from "@/types/logs";

type CheckError = NonNullable<CheckResult["error"]>;

export function ErrorBlock({ error }: { error: CheckError }) {
  const copy = useCopy();

  return (
    <div className="mx-5 mt-4 flex flex-col gap-2 rounded-md bg-down-soft p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-sm border border-down/40 px-1.5 text-caps font-medium tracking-wider text-down uppercase">
          {error.type}
        </span>
        <Button
          type="text"
          size="small"
          icon={<LuCopy />}
          onClick={() => copy(`${error.type}: ${error.message}`, "Error copied", error.message)}
        >
          Copy
        </Button>
      </div>
      <p className="font-mono text-xs break-words text-ink">{error.message}</p>
    </div>
  );
}
