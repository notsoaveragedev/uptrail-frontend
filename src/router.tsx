import { createBrowserRouter, Navigate } from "react-router";
import { LayoutErrorBoundary, RootErrorBoundary } from "@/components/errors/RouteErrorBoundary";
import { FullPageLoader } from "@/components/ui/FullPageLoader";
import { RootLayout } from "@/layouts/RootLayout";
import { lazyPage } from "@/lib/lazyPage";
import { DEFAULT_APP_PATH } from "@/lib/safeRedirect";
import { InAppNotFoundPage, NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    ErrorBoundary: RootErrorBoundary,
    HydrateFallback: FullPageLoader,
    children: [
      { path: "/", element: <Navigate to={DEFAULT_APP_PATH} replace /> },
      {
        lazy: lazyPage(() => import("@/layouts/AuthLayout"), "AuthLayout"),
        children: [
          {
            ErrorBoundary: LayoutErrorBoundary,
            children: [
              { path: "login", lazy: lazyPage(() => import("@/pages/auth/LoginPage"), "LoginPage") },
              { path: "login/2fa", lazy: lazyPage(() => import("@/pages/auth/TwoFactorPage"), "TwoFactorPage") },
              { path: "signup", lazy: lazyPage(() => import("@/pages/auth/SignupPage"), "SignupPage") },
              { path: "verify-email", lazy: lazyPage(() => import("@/pages/auth/VerifyEmailPage"), "VerifyEmailPage") },
              {
                path: "forgot-password",
                lazy: lazyPage(() => import("@/pages/auth/ForgotPasswordPage"), "ForgotPasswordPage"),
              },
              {
                path: "reset-password",
                lazy: lazyPage(() => import("@/pages/auth/ResetPasswordPage"), "ResetPasswordPage"),
              },
              {
                path: "oauth/callback",
                lazy: lazyPage(() => import("@/pages/auth/OAuthCallbackPage"), "OAuthCallbackPage"),
              },
              { path: "invite/:token", lazy: lazyPage(() => import("@/pages/InvitePage"), "InvitePage") },
            ],
          },
        ],
      },
      {
        path: "o/:orgSlug/dashboards/:dashboardId/tv",
        ErrorBoundary: RootErrorBoundary,
        lazy: lazyPage(() => import("@/pages/dashboards/DashboardTvPage"), "DashboardTvPage"),
      },
      {
        path: "o/:orgSlug",
        lazy: lazyPage(() => import("@/layouts/AppLayout"), "AppLayout"),
        children: [
          {
            ErrorBoundary: LayoutErrorBoundary,
            children: [
              { index: true, lazy: lazyPage(() => import("@/pages/app/OverviewPage"), "OverviewPage") },
              { path: "monitors", lazy: lazyPage(() => import("@/pages/monitors/MonitorsPage"), "MonitorsPage") },
              {
                path: "monitors/new",
                lazy: lazyPage(() => import("@/pages/monitors/NewMonitorPage"), "NewMonitorPage"),
              },
              {
                path: "monitors/import",
                lazy: lazyPage(() => import("@/pages/monitors/ImportMonitorsPage"), "ImportMonitorsPage"),
              },
              {
                path: "monitors/:monitorId",
                lazy: lazyPage(() => import("@/pages/monitors/MonitorDetailPage"), "MonitorDetailPage"),
              },
              { path: "logs", lazy: lazyPage(() => import("@/pages/logs/LogsPage"), "LogsPage") },
              {
                path: "dashboards",
                lazy: lazyPage(() => import("@/pages/dashboards/DashboardsPage"), "DashboardsPage"),
              },
              {
                path: "dashboards/:dashboardId",
                lazy: lazyPage(() => import("@/pages/dashboards/DashboardPage"), "DashboardPage"),
              },
              {
                path: "alerts",
                lazy: lazyPage(() => import("@/layouts/AlertsLayout"), "AlertsLayout"),
                children: [
                  { index: true, element: <Navigate to="rules" replace /> },
                  { path: "rules", lazy: lazyPage(() => import("@/pages/alerts/AlertRulesPage"), "AlertRulesPage") },
                  {
                    path: "channels",
                    lazy: lazyPage(() => import("@/pages/alerts/AlertChannelsPage"), "AlertChannelsPage"),
                  },
                  {
                    path: "history",
                    lazy: lazyPage(() => import("@/pages/alerts/AlertHistoryPage"), "AlertHistoryPage"),
                  },
                ],
              },
              {
                path: "alerts/rules/new",
                lazy: lazyPage(() => import("@/pages/alerts/AlertRulePage"), "AlertRulePage"),
              },
              {
                path: "alerts/rules/:ruleId",
                lazy: lazyPage(() => import("@/pages/alerts/AlertRulePage"), "AlertRulePage"),
              },
              {
                path: "monitors/:monitorId/edit",
                lazy: lazyPage(() => import("@/pages/monitors/EditMonitorPage"), "EditMonitorPage"),
              },
              { path: "*", Component: InAppNotFoundPage },
            ],
          },
        ],
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
