import { useEffect, useEffectEvent } from "react";

export function useWindowKeydown(handler: (event: KeyboardEvent) => void) {
  const handleKeyDown = useEffectEvent(handler);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
