import { createBrowserRouter, Navigate, Outlet, type RouteObject } from "react-router";
import { LayoutErrorBoundary, RootErrorBoundary } from "@/components/errors/RouteErrorBoundary";
import { RequirePermission } from "@/components/rbac/RequirePermission";
import { FullPageLoader } from "@/components/ui/FullPageLoader";
import { RootLayout } from "@/layouts/RootLayout";
import { lazyPage } from "@/lib/lazyPage";
import { InAppNotFoundPage, NotFoundPage } from "@/pages/NotFoundPage";
import { ServerErrorPage } from "@/pages/ServerErrorPage";

function guarded(permission: string, route: RouteObject): RouteObject {
  return {
    element: (
      <RequirePermission permission={permission}>
        <Outlet />
      </RequirePermission>
    ),
    children: [route],
  };
}

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    ErrorBoundary: RootErrorBoundary,
    HydrateFallback: FullPageLoader,
    children: [
      { index: true, lazy: lazyPage(() => import("@/pages/LandingPage"), "LandingPage") },
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
        path: "status/:slug",
        ErrorBoundary: RootErrorBoundary,
        children: [
          { index: true, lazy: lazyPage(() => import("@/pages/public-status/PublicStatusPage"), "PublicStatusPage") },
          {
            path: "incidents/:incidentId",
            lazy: lazyPage(() => import("@/pages/public-status/PublicIncidentPage"), "PublicIncidentPage"),
          },
          {
            path: "subscribe/confirm",
            lazy: lazyPage(() => import("@/pages/public-status/SubscribeConfirmPage"), "SubscribeConfirmPage"),
          },
          {
            path: "unsubscribe",
            lazy: lazyPage(() => import("@/pages/public-status/UnsubscribePage"), "UnsubscribePage"),
          },
        ],
      },
      {
        lazy: lazyPage(() => import("@/layouts/SessionLayout"), "SessionLayout"),
        children: [
          { path: "onboarding", lazy: lazyPage(() => import("@/pages/OnboardingPage"), "OnboardingPage") },
          {
            path: "account",
            lazy: lazyPage(() => import("@/layouts/AccountLayout"), "AccountLayout"),
            children: [
              {
                ErrorBoundary: LayoutErrorBoundary,
                children: [
                  { index: true, lazy: lazyPage(() => import("@/layouts/AccountLayout"), "AccountIndexRedirect") },
                  { path: "profile", lazy: lazyPage(() => import("@/pages/account/ProfilePage"), "ProfilePage") },
                  { path: "security", lazy: lazyPage(() => import("@/pages/account/SecurityPage"), "SecurityPage") },
                  {
                    path: "notifications",
                    lazy: lazyPage(
                      () => import("@/pages/account/NotificationPreferencesPage"),
                      "NotificationPreferencesPage",
                    ),
                  },
                  {
                    path: "organizations",
                    lazy: lazyPage(() => import("@/pages/account/OrganizationsPage"), "OrganizationsPage"),
                  },
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
                    path: "incidents",
                    lazy: lazyPage(() => import("@/pages/incidents/IncidentsPage"), "IncidentsPage"),
                  },
                  {
                    path: "incidents/:incidentId",
                    lazy: lazyPage(() => import("@/pages/incidents/IncidentPage"), "IncidentPage"),
                  },
                  {
                    path: "status-pages",
                    lazy: lazyPage(() => import("@/pages/status-pages/StatusPagesPage"), "StatusPagesPage"),
                  },
                  {
                    path: "status-pages/:pageId/edit",
                    lazy: lazyPage(() => import("@/pages/status-pages/StatusPageEditorPage"), "StatusPageEditorPage"),
                  },
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
                      {
                        path: "rules",
                        lazy: lazyPage(() => import("@/pages/alerts/AlertRulesPage"), "AlertRulesPage"),
                      },
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
                  guarded("project:read", {
                    path: "projects",
                    lazy: lazyPage(() => import("@/pages/projects/ProjectsPage"), "ProjectsPage"),
                  }),
                  guarded("project:read", {
                    path: "projects/:projectSlug",
                    lazy: lazyPage(() => import("@/layouts/ProjectLayout"), "ProjectLayout"),
                    children: [
                      {
                        index: true,
                        lazy: lazyPage(() => import("@/pages/projects/ProjectOverviewPage"), "ProjectOverviewPage"),
                      },
                      {
                        path: "monitors",
                        lazy: lazyPage(() => import("@/pages/projects/ProjectMonitorsPage"), "ProjectMonitorsPage"),
                      },
                      {
                        path: "incidents",
                        lazy: lazyPage(() => import("@/pages/projects/ProjectIncidentsPage"), "ProjectIncidentsPage"),
                      },
                      {
                        path: "access",
                        lazy: lazyPage(() => import("@/pages/projects/ProjectAccessPage"), "ProjectAccessPage"),
                      },
                    ],
                  }),
                  guarded("monitor:update", {
                    path: "maintenance",
                    lazy: lazyPage(() => import("@/pages/maintenance/MaintenancePage"), "MaintenancePage"),
                  }),
                  {
                    path: "notifications",
                    lazy: lazyPage(() => import("@/pages/notifications/NotificationsPage"), "NotificationsPage"),
                  },
                  {
                    path: "settings",
                    lazy: lazyPage(() => import("@/layouts/SettingsLayout"), "SettingsLayout"),
                    children: [
                      {
                        index: true,
                        lazy: lazyPage(() => import("@/layouts/SettingsLayout"), "SettingsIndexRedirect"),
                      },
                      guarded("org:settings", {
                        path: "general",
                        lazy: lazyPage(() => import("@/pages/settings/GeneralSettingsPage"), "GeneralSettingsPage"),
                      }),
                      guarded("member:read", {
                        path: "members",
                        lazy: lazyPage(() => import("@/pages/settings/MembersPage"), "MembersPage"),
                      }),
                      guarded("role:read", {
                        path: "roles",
                        lazy: lazyPage(() => import("@/pages/settings/RolesPage"), "RolesPage"),
                      }),
                      guarded("role:read", {
                        path: "roles/:roleId",
                        lazy: lazyPage(() => import("@/pages/settings/RoleEditorPage"), "RoleEditorPage"),
                      }),
                      guarded("apikey:manage", {
                        path: "api-keys",
                        lazy: lazyPage(() => import("@/pages/settings/ApiKeysPage"), "ApiKeysPage"),
                      }),
                      guarded("auditlog:view", {
                        path: "audit-log",
                        lazy: lazyPage(() => import("@/pages/settings/AuditLogPage"), "AuditLogPage"),
                      }),
                    ],
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
        ],
      },
      { path: "500", Component: ServerErrorPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
