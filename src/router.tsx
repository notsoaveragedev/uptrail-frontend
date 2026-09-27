import { createBrowserRouter, Navigate } from "react-router";
import { LayoutErrorBoundary, RootErrorBoundary } from "@/components/errors/RouteErrorBoundary";
import { FullPageLoader } from "@/components/ui/FullPageLoader";
import { RootLayout } from "@/layouts/RootLayout";
import { lazyPage } from "@/lib/lazyPage";
import { InAppNotFoundPage, NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    ErrorBoundary: RootErrorBoundary,
    HydrateFallback: FullPageLoader,
    children: [
      { path: "/", element: <Navigate to="/o/pixelcraft" replace /> },
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
