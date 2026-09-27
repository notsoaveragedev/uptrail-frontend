import { Outlet } from "react-router";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

export function RootLayout() {
  return (
    <>
      <NavigationProgress />
      <Outlet />
    </>
  );
}
