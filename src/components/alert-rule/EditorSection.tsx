import type { ReactNode } from "react";

type EditorSectionProps = {
  title: string;
  titleId: string;
  extra?: ReactNode;
  children: ReactNode;
};

export function EditorSection({ title, titleId, extra, children }: EditorSectionProps) {
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4 border-t border-line p-5 first:border-t-0">
      <div className="flex min-h-7 items-center justify-between gap-3">
        <h2 id={titleId} className="text-md font-semibold">
          {title}
        </h2>
        {extra}
      </div>
      {children}
    </section>
  );
}
