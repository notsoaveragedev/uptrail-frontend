import { lazy, Suspense } from "react";

// Loaded only in development, so the devtools never ship in the production bundle.
const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((module) => ({ default: module.ReactQueryDevtools })),
);

export function QueryDevtools() {
  if (!import.meta.env.DEV) return null;

  return (
    <Suspense fallback={null}>
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </Suspense>
  );
}
