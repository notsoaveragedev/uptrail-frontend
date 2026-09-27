import { Outlet } from "react-router";

// The org-scoped app shell. The sidebar and top bar mount here, around the page outlet.
export function AppLayout() {
  return (
    <div className="flex h-screen bg-canvas">
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-360 px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
