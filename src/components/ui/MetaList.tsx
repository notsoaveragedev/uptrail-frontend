import { Children, Fragment, type HTMLAttributes } from "react";

export function MetaSeparator() {
  return (
    <span aria-hidden className="text-faint">
      ·
    </span>
  );
}

export function MetaList({ children, className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const items = Children.toArray(children);

  return (
    <p {...props} className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <MetaSeparator />}
          {item}
        </Fragment>
      ))}
    </p>
  );
}
