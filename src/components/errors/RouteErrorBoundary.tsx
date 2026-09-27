import { Button } from "antd";
import { LuRefreshCw, LuTriangleAlert } from "react-icons/lu";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import { isChunkLoadError } from "@/lib/lazyPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { StatusScreen } from "./StatusScreen";

function RouteErrorBoundary({ isFullPage }: { isFullPage: boolean }) {
  const error = useRouteError();
  const navigate = useNavigate();
  const reload = () => window.location.reload();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage isFullPage={isFullPage} />;

  if (isChunkLoadError(error)) {
    return (
      <StatusScreen
        isFullPage={isFullPage}
        icon={<LuRefreshCw />}
        title="A new version is available"
        description="Uptrail was updated since you opened this tab. Reload to get the latest version."
        actions={
          <Button type="primary" onClick={reload}>
            Reload
          </Button>
        }
      />
    );
  }

  const message = error instanceof Error ? error.message : String(error);

  return (
    <StatusScreen
      isFullPage={isFullPage}
      icon={<LuTriangleAlert />}
      eyebrow="Something went wrong"
      title="This page couldn't load"
      description="An unexpected error stopped this page from rendering. Try again, or head back to the overview."
      actions={
        <>
          <Button type="primary" onClick={reload}>
            Try again
          </Button>
          <Button onClick={() => navigate("/")}>Go to overview</Button>
        </>
      }
      details={import.meta.env.DEV ? message : undefined}
    />
  );
}

// Top-level: nothing else rendered, so the screen fills the page.
export function RootErrorBoundary() {
  return <RouteErrorBoundary isFullPage />;
}

// Inside a layout: the app shell stays usable around the error.
export function LayoutErrorBoundary() {
  return <RouteErrorBoundary isFullPage={false} />;
}
