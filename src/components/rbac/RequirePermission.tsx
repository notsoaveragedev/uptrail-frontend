import { Button } from "antd";
import type { ReactNode } from "react";
import { LuShieldX } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { StatusScreen } from "@/components/errors/StatusScreen";
import { usePermission } from "@/hooks/usePermission";
import { paths } from "@/lib/paths";

type RequirePermissionProps = { permission: string; children: ReactNode };

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const check = usePermission(permission);
  return check.allowed ? children : <ForbiddenScreen reason={check.reason} permission={permission} />;
}

function ForbiddenScreen({ reason, permission }: { reason: string | null; permission: string }) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();

  return (
    <StatusScreen
      icon={<LuShieldX />}
      eyebrow="403"
      title="You don't have access to this page"
      description={`${reason} Ask an Owner or Admin to grant ${permission}.`}
      actions={
        <>
          <Button type="primary" onClick={() => navigate(paths.overview(orgSlug))}>
            Go to overview
          </Button>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </>
      }
    />
  );
}
