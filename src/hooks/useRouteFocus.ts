import { useEffect } from "react";
import { useLocation } from "react-router";

export function useRouteFocus() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.querySelector("main")?.scrollTo({ top: 0 });
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [pathname]);
}
