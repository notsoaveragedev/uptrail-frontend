import { useId, useState } from "react";
import { LuChevronRight } from "react-icons/lu";
import { worstStatus } from "@/lib/publicStatus";
import type { SnapshotComponent } from "@/types/statusPage";
import { ComponentRow } from "./ComponentRow";
import { ComponentStatusBadge } from "./ComponentStatusBadge";

type ComponentGroupProps = {
  name: string;
  components: SnapshotComponent[];
  isInitiallyOpen: boolean;
  dayCount: number;
  showBars: boolean;
  flashingIds: Set<string>;
};

export function ComponentGroup({
  name,
  components,
  isInitiallyOpen,
  dayCount,
  showBars,
  flashingIds,
}: ComponentGroupProps) {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const listId = useId();

  return (
    <section className="rounded-lg border border-line bg-card">
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-left"
        >
          <LuChevronRight
            aria-hidden
            className={`size-4 shrink-0 text-subtle transition-transform ${isOpen ? "rotate-90" : ""}`}
          />
          <span className="text-md font-semibold">{name}</span>
          <span className="text-xs text-subtle">
            {components.length} {components.length === 1 ? "component" : "components"}
          </span>
          <span className="ml-auto">
            <ComponentStatusBadge status={worstStatus(components)} />
          </span>
        </button>
      </h3>
      {isOpen && (
        <ul id={listId} className="divide-y divide-line border-t border-line">
          {components.map((component) => (
            <ComponentRow
              key={component.id}
              component={component}
              dayCount={dayCount}
              showBars={showBars}
              isFlashing={flashingIds.has(component.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
