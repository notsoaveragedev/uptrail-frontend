import { matchRoutes, type RouteObject } from "react-router";

let appRoutes: RouteObject[] = [];
const preloaded = new WeakSet<RouteObject>();

export function registerRoutes(routes: RouteObject[]) {
  appRoutes = routes;
}

export function preloadRoute(pathname: string) {
  for (const { route } of matchRoutes(appRoutes, pathname) ?? []) {
    if (typeof route.lazy !== "function" || preloaded.has(route)) continue;
    preloaded.add(route);
    route.lazy().catch(() => preloaded.delete(route));
  }
}
