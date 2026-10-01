import { Button } from "antd";
import { LuGlobe, LuPlus } from "react-icons/lu";

export function StatusPagesEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <section
      aria-labelledby="status-pages-empty-title"
      className="flex items-start gap-3 rounded-lg border border-line p-6"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-line text-muted">
        <LuGlobe aria-hidden className="size-4" />
      </span>
      <div className="flex flex-col items-start gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="status-pages-empty-title" className="text-md font-semibold">
            No status pages yet
          </h2>
          <p className="text-muted">
            Give customers one place to check uptime and follow incidents. Free on every plan.
          </p>
        </div>
        <Button type="primary" icon={<LuPlus />} onClick={onCreate}>
          New status page
        </Button>
      </div>
    </section>
  );
}
