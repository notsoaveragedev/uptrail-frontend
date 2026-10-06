import type { ReactNode } from "react";

type SectionHeadingProps = {
  titleId: string;
  title: string;
  eyebrow?: string;
  isCentered?: boolean;
  children: ReactNode;
};

export function SectionHeading({ titleId, title, eyebrow, isCentered = false, children }: SectionHeadingProps) {
  return (
    <div className={`flex flex-col ${isCentered ? "items-center text-center" : ""}`}>
      {eyebrow && <p className="mb-4 text-caps font-semibold tracking-widest text-subtle uppercase">{eyebrow}</p>}
      <h2 id={titleId} className="display-stretch max-w-3xl text-display font-semibold tracking-tight md:text-headline">
        {title}
      </h2>
      <p className="mt-4 max-w-xl text-body text-pretty text-muted md:text-lead">{children}</p>
    </div>
  );
}
