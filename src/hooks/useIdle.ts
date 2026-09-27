import { useEffect, useState } from "react";

const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel"] as const;

export function useIdle(timeoutMs: number) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timer = setTimeout(() => setIsIdle(true), timeoutMs);

    function markActive() {
      setIsIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), timeoutMs);
    }

    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, markActive, { passive: true });
    return () => {
      clearTimeout(timer);
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, markActive);
    };
  }, [timeoutMs]);

  return isIdle;
}
