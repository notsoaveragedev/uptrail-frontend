import { LuCircleCheck, LuCircleX } from "react-icons/lu";
import type { ChannelTestResult } from "@/hooks/useChannelTest";

export function TestResultRow({ result }: { result: ChannelTestResult }) {
  return (
    <p
      role="status"
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${result.ok ? "bg-up-soft text-up" : "bg-down-soft text-down"}`}
    >
      {result.ok ? <LuCircleCheck className="size-3.5 shrink-0" /> : <LuCircleX className="size-3.5 shrink-0" />}
      {result.ok ? (
        <span>
          Delivered in <span className="font-mono">{result.elapsedMs} ms</span> · 200 OK
        </span>
      ) : (
        <span>{result.message} Check the URL and try again.</span>
      )}
    </p>
  );
}
