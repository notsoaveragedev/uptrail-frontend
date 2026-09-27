import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { overviewKey } from "@/api/overview";
import { simulateCheck } from "@/mocks/overview";
import type { Overview, TimeRange } from "@/types/overview";

const CHECK_INTERVAL_MS = 3000;

export function useLiveChecks(orgSlug: string, range: TimeRange) {
  const queryClient = useQueryClient();
  const [isPaused, setIsPaused] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused) {
        setPendingCount((count) => count + 1);
        return;
      }
      queryClient.setQueryData<Overview>(
        overviewKey(orgSlug, range),
        (overview) => overview && { ...overview, monitors: simulateCheck(overview.monitors) },
      );
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [queryClient, orgSlug, range, isPaused]);

  function resume() {
    setIsPaused(false);
    setPendingCount(0);
  }

  return { isPaused, pendingCount, pause: () => setIsPaused(true), resume };
}
