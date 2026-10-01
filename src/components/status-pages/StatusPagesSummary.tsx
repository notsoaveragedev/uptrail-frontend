import { MetaList } from "@/components/ui/MetaList";
import { TONE_TEXT } from "@/lib/status";
import { OVERALL_STATUS_TONE } from "@/lib/statusTheme";
import type { StatusPage, StatusSnapshot } from "@/types/statusPage";

type StatusPagesSummaryProps = {
  pages: StatusPage[];
  snapshots: StatusSnapshot[];
};

export function StatusPagesSummary({ pages, snapshots }: StatusPagesSummaryProps) {
  const published = pages.filter((page) => page.published).length;
  const withIssues = snapshots.filter((snapshot) => snapshot.overall !== "operational").length;
  const worst = snapshots.find((snapshot) => OVERALL_STATUS_TONE[snapshot.overall] === "down") ?? snapshots[0];

  return (
    <MetaList>
      <span>
        <span className="font-mono text-ink">{pages.length}</span> status pages
      </span>
      <span>
        <span className="font-mono text-up">{published}</span> published
      </span>
      <span>
        <span className="font-mono text-ink">{pages.length - published}</span> draft
      </span>
      {withIssues === 0 ? (
        <span className="text-up">all operational</span>
      ) : (
        <span className={TONE_TEXT[OVERALL_STATUS_TONE[worst.overall]]}>
          <span className="font-mono">{withIssues}</span> showing issues
        </span>
      )}
    </MetaList>
  );
}
