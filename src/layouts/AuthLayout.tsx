import { Link, Outlet, useLocation } from "react-router";
import { StatusBoard } from "@/components/auth/StatusBoard";
import { SystemStatusLine } from "@/components/layout/SystemStatusLine";
import { Logo } from "@/components/Logo";

export function AuthLayout() {
  return (
    <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr_auto] bg-canvas lg:grid-cols-[30rem_1fr]">
      <header className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-12 lg:col-span-2">
        <Link to="/" aria-label="Uptrail home" className="rounded-md">
          <Logo />
        </Link>
        <AccountSwitchLink />
      </header>

      <main className="px-6 pt-12 pb-16 sm:px-12 lg:pt-[12vh]">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>

      <StatusBoard />

      <footer className="flex items-center justify-between gap-4 border-t border-line px-6 py-4 text-xs text-subtle sm:px-12 lg:col-span-2">
        <SystemStatusLine />
        <p>© {new Date().getFullYear()} Uptrail</p>
      </footer>
    </div>
  );
}

function AccountSwitchLink() {
  const isSignup = useLocation().pathname === "/signup";

  return (
    <p className="text-muted">
      <span className="hidden sm:inline">{isSignup ? "Have an account? " : "New to Uptrail? "}</span>
      <Link to={isSignup ? "/login" : "/signup"} className="font-medium">
        {isSignup ? "Sign in" : "Create an account"}
      </Link>
    </p>
  );
}
