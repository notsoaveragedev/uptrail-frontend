import { memo, Suspense, type HTMLAttributes, type ReactNode } from "react";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { WidgetSkeleton } from "@/components/widgets/WidgetSkeleton";
import { widgetRange, WIDGETS } from "@/lib/widgets";
import type { DashboardRange, DashboardWidget } from "@/types/dashboard";
import { useWidgetFetching } from "./useWidgetFetching";

type WidgetFrameProps = {
  widget: DashboardWidget;
  range: DashboardRange;
  syncKey: string;
  isPreview?: boolean;
  lead?: ReactNode;
  actions?: ReactNode;
  titleBarProps?: HTMLAttributes<HTMLDivElement>;
  bodyProps?: HTMLAttributes<HTMLDivElement>;
  className?: string;
  children?: ReactNode;
};

export function WidgetFrame({
  widget,
  range,
  syncKey,
  isPreview = false,
  lead,
  actions,
  titleBarProps,
  bodyProps,
  className = "",
  children,
}: WidgetFrameProps) {
  const definition = WIDGETS[widget.type];
  const effectiveRange = widgetRange(widget, range);
  const isFetching = useWidgetFetching(widget, range);

  return (
    <section
      aria-label={widget.title}
      className={`group/widget @container/widget relative flex h-full flex-col overflow-hidden rounded-lg border bg-card ${className}`}
    >
      <div
        {...titleBarProps}
        className={`relative flex h-9 shrink-0 items-center gap-2 px-3 ${titleBarProps?.className ?? ""}`}
      >
        {lead}
        <h3 className="min-w-0 truncate text-sm font-medium">{widget.title || definition.defaultTitle}</h3>
        <span className="hidden min-w-0 truncate font-mono text-xs text-subtle @[20rem]/widget:inline">
          {definition.metaLine(widget)}
        </span>
        {effectiveRange !== range && (
          <span className="shrink-0 rounded-sm bg-hover px-1.5 font-mono text-xs text-muted" title="Range override">
            {effectiveRange}
          </span>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-0.5">{actions}</span>
        {isFetching && (
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
            <span className="block h-full w-1/3 animate-progress bg-accent" />
          </span>
        )}
      </div>
      <div {...bodyProps} className={`min-h-0 flex-1 px-4 pt-1 pb-3 ${bodyProps?.className ?? ""}`}>
        <WidgetBody widget={widget} range={range} syncKey={syncKey} isPreview={isPreview} />
      </div>
      {children}
    </section>
  );
}

type WidgetBodyProps = {
  widget: DashboardWidget;
  range: DashboardRange;
  syncKey: string;
  isPreview: boolean;
};

const WidgetBody = memo(function WidgetBody({ widget, range, syncKey, isPreview }: WidgetBodyProps) {
  const { Component } = WIDGETS[widget.type];

  return (
    <SectionErrorBoundary>
      <Suspense fallback={<WidgetSkeleton type={widget.type} />}>
        <Component widget={widget} range={range} syncKey={syncKey} isPreview={isPreview} />
      </Suspense>
    </SectionErrorBoundary>
  );
});
