import type { Ref } from "react";

type StepHeadingProps = {
  title: string;
  description: string;
  ref?: Ref<HTMLHeadingElement>;
};

export function StepHeading({ title, description, ref }: StepHeadingProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 ref={ref} tabIndex={-1} className="text-md font-semibold outline-none">
        {title}
      </h2>
      <p className="text-muted">{description}</p>
    </div>
  );
}
