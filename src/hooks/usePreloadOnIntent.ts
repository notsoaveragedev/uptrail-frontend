import { useResolvedPath, type To } from "react-router";
import { preloadRoute } from "@/lib/preloadRoute";

export function usePreloadOnIntent(to: To) {
  const { pathname } = useResolvedPath(to);
  const preload = () => preloadRoute(pathname);
  return { onMouseEnter: preload, onFocus: preload };
}
