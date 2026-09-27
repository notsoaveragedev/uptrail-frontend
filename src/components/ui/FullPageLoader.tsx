import { Loader } from "./Loader";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Loader size="lg" label="Loading Uptrail" className="text-accent" />
    </div>
  );
}
