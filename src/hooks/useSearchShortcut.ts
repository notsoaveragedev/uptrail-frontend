import { useEffect, useEffectEvent } from "react";

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return !!element && (element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName));
}

export function useSearchShortcut(onToggle: () => void) {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const isModK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    const isSlash = event.key === "/" && !isTypingTarget(event.target);
    if (!isModK && !isSlash) return;
    event.preventDefault();
    onToggle();
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
