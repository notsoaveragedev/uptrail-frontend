import { type RefObject, useEffect } from "react";

function setFlag(element: HTMLElement, name: string, isOn: boolean) {
  if (element.hasAttribute(name) !== isOn) element.toggleAttribute(name, isOn);
}

export function useScrollEdges(scrollRef: RefObject<HTMLElement | null>, contentWidth: number) {
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    function update() {
      const maxLeft = scroller!.scrollWidth - scroller!.clientWidth;
      setFlag(scroller!, "data-overflow-left", scroller!.scrollLeft > 0);
      setFlag(scroller!, "data-overflow-right", scroller!.scrollLeft < maxLeft - 1);
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    scroller.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", update);
    };
  }, [scrollRef, contentWidth]);
}
