import { useEffect, useRef, type ReactNode } from "react";

type AuthHeadingProps = {
  route: string;
  title: string;
  description?: ReactNode;
  autoFocus?: boolean;
};

export function AuthHeading({ route, title, description, autoFocus = true }: AuthHeadingProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (autoFocus) titleRef.current?.focus();
  }, [autoFocus]);

  return (
    <header className="mb-8">
      <p aria-hidden className="font-mono text-xs text-subtle">
        {route}
      </p>
      <h1 ref={titleRef} tabIndex={-1} className="mt-3 text-lg font-semibold tracking-tight outline-none">
        {title}
      </h1>
      {description && <p className="mt-1.5 text-muted">{description}</p>}
    </header>
  );
}
