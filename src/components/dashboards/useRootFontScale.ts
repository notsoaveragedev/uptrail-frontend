import { useLayoutEffect } from "react";

export function useRootFontScale(fontSize: string) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = fontSize;
    return () => {
      root.style.fontSize = previous;
    };
  }, [fontSize]);
}
