import { LuCheck, LuX } from "react-icons/lu";
import type { CheckResultDetail } from "@/types/logs";
import { DrawerSection } from "./DrawerSection";

type Assertion = CheckResultDetail["assertions"][number];

export function AssertionList({ assertions }: { assertions: Assertion[] }) {
  const passed = assertions.filter((assertion) => assertion.passed).length;

  return (
    <DrawerSection
      title="Assertions"
      extra={
        <span className="font-mono text-xs text-subtle">
          {passed}/{assertions.length} passed
        </span>
      }
    >
      <ul className="flex flex-col gap-2">
        {assertions.map((assertion) => (
          <li key={assertion.name} className="grid grid-cols-[1rem_1fr_auto] items-center gap-2 text-sm">
            {assertion.passed ? (
              <LuCheck aria-label="Passed" className="size-4 text-up" />
            ) : (
              <LuX aria-label="Failed" className="size-4 text-down" />
            )}
            <span>{assertion.name}</span>
            <span className="font-mono text-xs text-subtle">
              expected <span className="text-muted">{assertion.expected}</span> · got{" "}
              <span className={assertion.passed ? "text-ink" : "text-down"}>{assertion.actual}</span>
            </span>
          </li>
        ))}
      </ul>
    </DrawerSection>
  );
}
