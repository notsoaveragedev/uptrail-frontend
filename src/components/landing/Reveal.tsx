import { useRef, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

export function Reveal({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  return (
    <div ref={ref} data-in-view={isInView} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
