import type { ReactNode } from "react";
import { Link } from "react-router";

type StatusLinkProps = {
  to: string;
  isPreview?: boolean;
  className?: string;
  children: ReactNode;
};

export function StatusLink({ to, isPreview = false, className = "", children }: StatusLinkProps) {
  const classes = `text-(--sp-primary) underline-offset-2 hover:text-(--sp-primary) hover:underline ${className}`;
  if (isPreview) {
    return (
      <a href={to} onClick={(event) => event.preventDefault()} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}
