import { Button, Empty } from "antd";
import { LuPlus } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router";
import { EXAMPLE_EXPRESSIONS } from "@/lib/alertLists";
import { paths } from "@/lib/paths";
import { ExpressionText } from "./ExpressionText";

export function RulesEmptyState() {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();

  return (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No alert rules. Get paged before your users notice.">
      <div className="flex flex-col items-center gap-4">
        <ul aria-label="Start from an example" className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_EXPRESSIONS.map((expression) => (
            <li key={expression}>
              <Link
                to={`${paths.alertRuleNew(orgSlug)}?expression=${encodeURIComponent(expression)}`}
                className="block rounded-md border border-line px-2 py-1 transition-colors hover:border-line-strong"
              >
                <ExpressionText expression={expression} />
              </Link>
            </li>
          ))}
        </ul>
        <Button type="primary" icon={<LuPlus />} onClick={() => navigate(paths.alertRuleNew(orgSlug))}>
          New rule
        </Button>
      </div>
    </Empty>
  );
}
