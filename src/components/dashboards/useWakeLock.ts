import { useEffect, useState } from "react";

export function useWakeLock() {
  const [isAwake, setIsAwake] = useState(false);

  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    let isActive = true;

    async function request() {
      if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
      try {
        sentinel = await navigator.wakeLock.request("screen");
        if (!isActive) {
          void sentinel.release();
          return;
        }
        setIsAwake(true);
        sentinel.addEventListener("release", () => setIsAwake(false));
      } catch {
        setIsAwake(false);
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") void request();
    }

    void request();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      isActive = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      void sentinel?.release();
    };
  }, []);

  return isAwake;
}
