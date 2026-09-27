import type { CSSProperties } from "react";

type SkeletonBlockProps = {
  className?: string;
  isInset?: boolean;
  style?: CSSProperties;
};

export function SkeletonBlock({ className = "", isInset = false, style }: SkeletonBlockProps) {
  return (
    <div
      aria-hidden
      style={style}
      className={`animate-pulse ${isInset ? "rounded-md bg-hover" : "rounded-lg bg-card"} ${className}`}
    />
  );
}
