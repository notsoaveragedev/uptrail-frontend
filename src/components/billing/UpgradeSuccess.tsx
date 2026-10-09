import { Result } from "antd";
import { useParams } from "react-router";
import { LinkButton } from "@/components/ui/LinkButton";
import { paths } from "@/lib/paths";
import { PLAN_LIMITS } from "@/lib/plans";

export function UpgradeSuccess({ orgName, email }: { orgName: string; email: string }) {
  const { orgSlug = "" } = useParams();
  const pro = PLAN_LIMITS.pro;

  return (
    <Result
      status="success"
      title={`${orgName} is on Pro`}
      subTitle={`${pro.monitors} monitors, ${pro.minIntervalSec} second checks and unlimited members are live now. A receipt is on its way to ${email}.`}
      extra={[
        <LinkButton key="monitors" type="primary" to={paths.monitorNew(orgSlug)}>
          Add a monitor
        </LinkButton>,
        <LinkButton key="billing" to={paths.billing(orgSlug)}>
          View billing
        </LinkButton>,
      ]}
    />
  );
}
