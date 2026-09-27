import { isTypingTarget } from "@/lib/dom";
import { useWindowKeydown } from "./useWindowKeydown";

export function useSearchShortcut(onToggle: () => void) {
  useWindowKeydown((event) => {
    const isModK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    const isSlash = event.key === "/" && !isTypingTarget(event.target);
    if (!isModK && !isSlash) return;
    event.preventDefault();
    onToggle();
  });
}
