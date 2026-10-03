import type { ReactNode } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { fakeRequest } from "@/lib/fakeRequest";
import { MOBILE_STRIP_DAYS, worstStatus } from "@/lib/publicStatus";
import type { StatusSnapshot } from "@/types/statusPage";
import { ActiveIncidentCard } from "./ActiveIncidentCard";
import { ComponentGroup } from "./ComponentGroup";
import { MaintenanceCard } from "./MaintenanceCard";
import { OverallBanner } from "./OverallBanner";
import { PastIncidents } from "./PastIncidents";
import { StatusFooter } from "./StatusFooter";
import { StatusHeader } from "./StatusHeader";
import { StatusThemeScope } from "./StatusThemeScope";
import { useSnapshotChanges } from "./useSnapshotChanges";

type StatusPageViewProps = {
  snapshot: StatusSnapshot;
  isPreview?: boolean;
  viewport?: "desktop" | "mobile";
  lastCheckedAt?: number;
  notice?: ReactNode;
  onSubscribe?: (email: string) => Promise<void>;
};

function simulateSubscribe() {
  return fakeRequest(600);
}

export function StatusPageView({
  snapshot,
  isPreview = false,
  viewport,
  lastCheckedAt = snapshot.generatedAt,
  notice,
  onSubscribe = simulateSubscribe,
}: StatusPageViewProps) {
  const isNarrow = useMediaQuery("(max-width: 40rem)");
  const isMobile = (viewport ?? (isNarrow ? "mobile" : "desktop")) === "mobile";
  const { flashingIds, changedAt } = useSnapshotChanges(snapshot, !isPreview);
  const { historyDays, showUptimeBars } = snapshot.options;
  const dayCount = isMobile ? Math.min(MOBILE_STRIP_DAYS, historyDays) : historyDays;
  const Column = isPreview ? "div" : "main";
  const hasIssues = snapshot.groups.some((group) => worstStatus(group.components) !== "up");

  return (
    <StatusThemeScope theme={snapshot.theme} className={isPreview ? "" : "min-h-dvh"}>
      <Column className={`mx-auto flex w-full max-w-180 flex-col ${isMobile ? "gap-6 px-4 py-6" : "gap-8 px-6 py-12"}`}>
        <StatusHeader snapshot={snapshot} isMobile={isMobile} onSubscribe={onSubscribe} />
        {notice}
        <OverallBanner snapshot={snapshot} />
        {(snapshot.activeIncidents.length > 0 || snapshot.maintenance.length > 0) && (
          <div className="flex flex-col gap-3">
            {snapshot.activeIncidents.map((incident) => (
              <ActiveIncidentCard key={incident.id} incident={incident} slug={snapshot.slug} isPreview={isPreview} />
            ))}
            {snapshot.maintenance.map((item) => (
              <MaintenanceCard key={item.id} maintenance={item} />
            ))}
          </div>
        )}
        <section aria-label="Components" className="flex flex-col gap-3">
          {snapshot.groups.map((group) => (
            <ComponentGroup
              key={group.id}
              name={group.name}
              components={group.components}
              isInitiallyOpen={!hasIssues || worstStatus(group.components) !== "up"}
              dayCount={dayCount}
              showBars={showUptimeBars}
              flashingIds={flashingIds}
            />
          ))}
        </section>
        <PastIncidents
          history={snapshot.history}
          slug={snapshot.slug}
          historyDays={historyDays}
          now={snapshot.generatedAt}
          isPreview={isPreview}
          isMobile={isMobile}
        />
        <StatusFooter
          lastCheckedAt={lastCheckedAt}
          changedAt={changedAt}
          overall={snapshot.overall}
          isPreview={isPreview}
        />
      </Column>
    </StatusThemeScope>
  );
}
