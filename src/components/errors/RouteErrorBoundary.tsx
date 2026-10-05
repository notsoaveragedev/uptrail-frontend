import { Button } from "antd";
import { LuRefreshCw } from "react-icons/lu";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { isChunkLoadError } from "@/lib/lazyPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ServerErrorPage } from "@/pages/ServerErrorPage";
import { StatusScreen } from "./StatusScreen";

function RouteErrorBoundary({ isFullPage }: { isFullPage: boolean }) {
  const error = useRouteError();
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

  return <ServerErrorPage isFullPage={isFullPage} details={import.meta.env.DEV ? message : undefined} />;
}

export function RootErrorBoundary() {
  return <RouteErrorBoundary isFullPage />;
}

export function LayoutErrorBoundary() {
  return <RouteErrorBoundary isFullPage={false} />;
}
