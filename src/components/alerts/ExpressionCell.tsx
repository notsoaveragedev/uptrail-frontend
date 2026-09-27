import { Tooltip } from "antd";
import { ExpressionText } from "./ExpressionText";

export function ExpressionCell({ expression, className = "" }: { expression: string; className?: string }) {
  return (
    <Tooltip title={<ExpressionText expression={expression} />} placement="topLeft">
      <span className={`block min-w-0 ${className}`}>
        <ExpressionText expression={expression} className="block truncate whitespace-nowrap!" />
      </span>
    </Tooltip>
  );
}
