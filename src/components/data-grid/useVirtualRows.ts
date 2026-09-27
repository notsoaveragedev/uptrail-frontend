import { type RefObject, useEffect, useState } from "react";

type RowRange = { start: number; end: number };

export function useVirtualRows(
  scrollRef: RefObject<HTMLElement | null>,
  rowPx: number,
  headerPx: number,
  overscan: number,
) {
  const [range, setRange] = useState<RowRange>({ start: 0, end: 40 });

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    let frame = 0;

    function update() {
      frame = 0;
      const top = scroller!.scrollTop;
      const start = Math.max(0, Math.floor(top / rowPx) - overscan);
      const end = Math.ceil((top + scroller!.clientHeight - headerPx) / rowPx) + overscan;
      setRange((current) => (current.start === start && current.end === end ? current : { start, end }));
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(scroller);
    scroller.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener("scroll", schedule);
    };
  }, [scrollRef, rowPx, headerPx, overscan]);

  return range;
}
