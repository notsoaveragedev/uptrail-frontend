import { createBrowserRouter, Navigate } from "react-router";
import { LayoutErrorBoundary, RootErrorBoundary } from "@/components/errors/RouteErrorBoundary";
import { FullPageLoader } from "@/components/ui/FullPageLoader";
import { RootLayout } from "@/layouts/RootLayout";
import { lazyPage } from "@/lib/lazyPage";
import { InAppNotFoundPage, NotFoundPage } from "@/pages/NotFoundPage";

// Demo org until auth and org switching are wired.
const DEFAULT_ORG_SLUG = "pixelcraft";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    ErrorBoundary: RootErrorBoundary,
    HydrateFallback: FullPageLoader,
    children: [
      { path: "/", element: <Navigate to={`/o/${DEFAULT_ORG_SLUG}`} replace /> },
      {
        path: "o/:orgSlug",
        lazy: lazyPage(() => import("@/layouts/AppLayout"), "AppLayout"),
        children: [
          {
            ErrorBoundary: LayoutErrorBoundary,
            children: [
              { index: true, lazy: lazyPage(() => import("@/pages/app/OverviewPage"), "OverviewPage") },
              { path: "*", Component: InAppNotFoundPage },
            ],
          },
        ],
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
