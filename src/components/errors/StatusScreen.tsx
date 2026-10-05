import type { ReactNode } from "react";

type StatusScreenProps = {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  details?: string;
  isFullPage?: boolean;
  children?: ReactNode;
};

export function StatusScreen({
  icon,
  eyebrow,
  title,
  description,
  actions,
  details,
  isFullPage = false,
  children,
}: StatusScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center ${isFullPage ? "min-h-screen bg-canvas" : "py-24"}`}
    >
      <span className="flex size-11 items-center justify-center rounded-lg border border-line bg-card text-muted [&_svg]:size-5">
        {icon}
      </span>
      <div role="alert" className="flex flex-col items-center">
        {eyebrow && (
          <span className="mt-5 font-mono text-caps font-semibold tracking-widest text-subtle uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className={`${eyebrow ? "mt-1" : "mt-5"} text-lg font-semibold tracking-tight`}>{title}</h1>
        <p className="mt-2 max-w-96 text-muted">{description}</p>
      </div>
      {actions && <div className="mt-6 flex gap-2">{actions}</div>}
      {children}
      {details && (
        <pre className="mt-6 max-w-xl overflow-auto rounded-lg border border-line bg-panel p-3 text-left font-mono text-xs text-muted">
          {details}
        </pre>
      )}
    </div>
  );
}
