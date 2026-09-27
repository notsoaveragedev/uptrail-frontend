import type { ReactNode } from "react";

type GridCellProps = {
  rect: { left: number; top: number; width: number; height: number };
  isAnimated?: boolean;
  isLifted?: boolean;
  className?: string;
  children?: ReactNode;
};

export function GridCell({ rect, isAnimated = false, isLifted = false, className = "", children }: GridCellProps) {
  const motion = isAnimated ? "transition-transform duration-150 ease-out motion-reduce:transition-none" : "";
  const lift = isLifted ? "z-20 rounded-lg opacity-92 shadow-overlay" : "";

  return (
    <div
      data-grid-cell
      className={`absolute top-0 left-0 ${motion} ${lift} ${className}`}
      style={{
        width: rect.width,
        height: rect.height,
        transform: `translate(${rect.left}px, ${rect.top}px)${isLifted ? " scale(1.01)" : ""}`,
      }}
    >
      {children}
    </div>
  );
}
