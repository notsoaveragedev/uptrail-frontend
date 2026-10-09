import { useSearchParams } from "react-router";
import { ForbiddenScreen } from "@/components/errors/ForbiddenScreen";

export function ForbiddenPage() {
  const [params] = useSearchParams();
  return <ForbiddenScreen permission={params.get("permission")} isFullPage />;
}
