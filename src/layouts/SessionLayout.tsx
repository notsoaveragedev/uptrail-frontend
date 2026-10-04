import { Outlet } from "react-router";
import { SessionGuard } from "@/components/session/SessionGuard";

export function SessionLayout() {
  return (
    <>
      <Outlet />
      <SessionGuard />
    </>
  );
}
