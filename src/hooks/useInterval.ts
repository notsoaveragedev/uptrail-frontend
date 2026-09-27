import { useEffect, useEffectEvent } from "react";

export function useInterval(callback: () => void, delayMs: number | null) {
  const onTick = useEffectEvent(callback);

  useEffect(() => {
    if (delayMs === null) return;
    const timer = setInterval(() => onTick(), delayMs);
    return () => clearInterval(timer);
  }, [delayMs]);
}
