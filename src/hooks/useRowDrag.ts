import { useEffect, useEffectEvent, useState, type PointerEvent as ReactPointerEvent } from "react";

function targetIndex(draggingId: string, clientY: number) {
  const row = document.querySelector<HTMLElement>(`[data-node="${draggingId}"]`);
  const parentId = row?.dataset.parent;
  if (!row || !parentId) return null;
  const siblings = [...document.querySelectorAll<HTMLElement>(`[data-parent="${parentId}"]`)];
  return siblings
    .filter((sibling) => sibling !== row)
    .filter((sibling) => {
      const rect = sibling.getBoundingClientRect();
      return rect.top + rect.height / 2 < clientY;
    }).length;
}

export function useRowDrag(onMove: (id: string, index: number) => void) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handlePointerMove = useEffectEvent((event: PointerEvent) => {
    if (!draggingId) return;
    const index = targetIndex(draggingId, event.clientY);
    if (index !== null) onMove(draggingId, index);
  });

  useEffect(() => {
    if (!draggingId) return;
    const stop = () => setDraggingId(null);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [draggingId]);

  function startDrag(event: ReactPointerEvent, id: string) {
    if (event.button !== 0) return;
    event.preventDefault();
    setDraggingId(id);
  }

  return { draggingId, startDrag };
}
