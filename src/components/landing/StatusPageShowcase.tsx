import { Segmented } from "antd";
import { lazy, Suspense, useId, useMemo, useRef, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { Link } from "react-router";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SHOWCASE_SLUG, showcaseSnapshot, STATUS_EXAMPLES } from "@/lib/landing";
import { importWithReload } from "@/lib/lazyPage";
import { paths } from "@/lib/paths";
import type { ColorScheme } from "@/lib/statusTheme";
import { useThemeMode } from "@/theme/ThemeContext";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

const StatusPageView = lazy(() =>
  importWithReload(() => import("@/components/public-status/StatusPageView")).then((module) => ({
    default: module.StatusPageView,
  })),
);

const SCHEMES: { label: string; value: ColorScheme }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export function StatusPageShowcase() {
  const titleId = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const isNearView = useInView(frameRef, { rootMargin: "400px 0px" });
  const isNarrow = useMediaQuery("(max-width: 40rem)");
  const { mode } = useThemeMode();
  const [chosenScheme, setChosenScheme] = useState<ColorScheme | null>(null);
  const scheme = chosenScheme ?? mode;
  const baseSnapshot = useMemo(() => showcaseSnapshot(), []);
  const snapshot = useMemo(
    () => baseSnapshot && { ...baseSnapshot, theme: { ...baseSnapshot.theme, mode: scheme } },
    [baseSnapshot, scheme],
  );

  return (
    <section id="status-pages" aria-labelledby={titleId} className="scroll-mt-20 py-20 lg:py-28">
      <Container>
        <SectionHeading titleId={titleId} title="A status page that outlives your outage." isCentered>
          Served from a CDN snapshot, branded with your logo and colors, and free on every project. Customers subscribe
          to updates by email.
        </SectionHeading>

        <div ref={frameRef} className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex h-11 items-center justify-between gap-3 border-b border-line px-4">
            <span className="truncate rounded-md bg-panel px-2.5 py-1 font-mono text-xs text-muted">
              status.shopnest.in
            </span>
            <Segmented
              aria-label="Status page theme"
              size="small"
              value={scheme}
              onChange={setChosenScheme}
              options={SCHEMES}
            />
          </div>
          <div
            inert
            className="max-h-120 overflow-hidden [mask-image:linear-gradient(#000_78%,transparent)] sm:max-h-144"
          >
            {isNearView && snapshot ? (
              <Suspense fallback={<SkeletonBlock isInset className="h-144" />}>
                <StatusPageView snapshot={snapshot} isPreview viewport={isNarrow ? "mobile" : "desktop"} />
              </Suspense>
            ) : (
              <SkeletonBlock isInset className="h-144" />
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link to={paths.publicStatus(SHOWCASE_SLUG)} className="flex items-center gap-1.5 font-medium">
            Open the full status page
            <LuArrowRight aria-hidden className="size-3.5" />
          </Link>
          <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-subtle">
            More live examples
            {STATUS_EXAMPLES.filter((slug) => slug !== SHOWCASE_SLUG).map((slug) => (
              <Link key={slug} to={paths.publicStatus(slug)} className="font-mono">
                /status/{slug}
              </Link>
            ))}
          </p>
        </div>
      </Container>
    </section>
  );
}
