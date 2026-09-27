import { LuCircleCheck } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { paths } from "@/lib/paths";
import { TONE_BADGE } from "@/lib/status";
import type { AttentionItem } from "@/types/overview";

type NeedsAttentionProps = {
  items: AttentionItem[];
  healthyCount: number;
};

export function NeedsAttention({ items, healthyCount }: NeedsAttentionProps) {
  const { orgSlug = "" } = useParams();

  return (
    <section aria-labelledby="needs-attention">
      <h2 id="needs-attention" className="mb-3 text-caps font-semibold tracking-widest text-subtle uppercase">
        Needs your attention · <span className="text-down">{items.length}</span>
      </h2>

      <ul className="grid snap-x auto-cols-[minmax(17rem,1fr)] grid-flow-col gap-3 overflow-x-auto pb-1">
        {items.map((item, index) => {
          const isDown = item.severity === "down";
          return (
            <li
              key={item.id}
              className={`flex snap-start flex-col rounded-lg border border-l-2 border-line bg-card p-4 ${isDown ? "border-l-down" : "border-l-degraded"}`}
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-sm border border-line font-mono text-xs text-muted">
                  {index + 1}
                </span>
                <span
                  className={`rounded-sm px-1.5 py-0.5 text-caps font-semibold tracking-widest uppercase ${TONE_BADGE[isDown ? "down" : "degraded"]}`}
                >
                  {item.tag}
                </span>
                <span className="ml-auto font-mono text-xs text-subtle">{item.age}</span>
              </div>
              <h3 className="mt-3 font-semibold">{item.monitorName}</h3>
              <p className="mt-1 flex-1 text-muted">{item.diagnosis}</p>
              <Link to={paths.section(orgSlug, item.action.to)} className="mt-3 w-fit font-medium">
                {item.action.label} →
              </Link>
            </li>
          );
        })}
        <li className="flex snap-start flex-col justify-center gap-1 rounded-lg border border-dashed border-line p-4">
          <span className="flex items-center gap-2 font-medium">
            <LuCircleCheck aria-hidden className="size-4 text-up" />
            {healthyCount} other monitors healthy
          </span>
          <span className="text-subtle">No action needed right now.</span>
        </li>
      </ul>
    </section>
  );
}
