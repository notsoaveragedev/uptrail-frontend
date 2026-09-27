import { useNavigation } from "react-router";

// Thin bar at the top while a lazy route's code (or data) is loading.
export function NavigationProgress() {
  const isNavigating = useNavigation().state !== "idle";
  if (!isNavigating) return null;

  return (
    <div role="progressbar" aria-label="Loading page" className="fixed inset-x-0 top-0 z-1100 h-0.5 overflow-hidden">
      <div className="h-full w-1/3 animate-progress bg-accent" />
    </div>
  );
}
