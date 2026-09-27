type StatusDotProps = {
  fill?: string;
  className?: string;
};

export function StatusDot({ fill = "bg-current", className = "" }: StatusDotProps) {
  return <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${fill} ${className}`} />;
}
