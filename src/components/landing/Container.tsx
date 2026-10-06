import type { ReactNode } from "react";

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-304 px-4 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}
