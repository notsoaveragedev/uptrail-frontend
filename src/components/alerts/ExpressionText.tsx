import { highlightSegments, TOKEN_CLASS } from "@/lib/alertExpression/highlight";

type ExpressionTextProps = {
  expression: string;
  className?: string;
};

export function ExpressionText({ expression, className = "" }: ExpressionTextProps) {
  return (
    <code className={`font-mono text-xs whitespace-pre-wrap ${className}`}>
      {highlightSegments(expression).map((segment, index) => (
        <span key={index} className={segment.type ? TOKEN_CLASS[segment.type] : undefined}>
          {segment.text}
        </span>
      ))}
    </code>
  );
}
