import { useEffect, useState } from "react";
import { changedComponentIds, FLASH_MS } from "@/lib/publicStatus";
import type { StatusSnapshot } from "@/types/statusPage";

type SnapshotChange = { ids: Set<string>; at: number };

const NO_CHANGES = new Set<string>();

export function useSnapshotChanges(snapshot: StatusSnapshot, isEnabled: boolean) {
  const [previous, setPrevious] = useState(snapshot);
  const [change, setChange] = useState<SnapshotChange | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  if (previous !== snapshot) {
    setPrevious(snapshot);
    const ids = changedComponentIds(previous, snapshot);
    if (isEnabled && (ids.size > 0 || previous.overall !== snapshot.overall)) {
      setChange({ ids, at: snapshot.generatedAt });
      setIsFlashing(true);
    }
  }

  useEffect(() => {
    if (!isFlashing) return;
    const timer = setTimeout(() => setIsFlashing(false), FLASH_MS);
    return () => clearTimeout(timer);
  }, [isFlashing, change]);

  return {
    flashingIds: isFlashing && change ? change.ids : NO_CHANGES,
    changedAt: change?.at ?? null,
  };
}
