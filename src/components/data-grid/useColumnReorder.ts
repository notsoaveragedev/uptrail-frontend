import { type PointerEvent, type RefObject, useRef, useState } from "react";
import type { PinZone } from "@/lib/dataGrid";

type DropTarget = { key: string; targetKey: string; placeAfter: boolean; x: number };

type Session = { key: string; zone: PinZone; startX: number; drop: DropTarget | null };

type Options = {
  frameRef: RefObject<HTMLElement | null>;
  remPx: number;
  onMove: (key: string, targetKey: string, placeAfter: boolean) => void;
};

const DRAG_THRESHOLD_PX = 4;

export function useColumnReorder({ frameRef, remPx, onMove }: Options) {
  const [drop, setDrop] = useState<DropTarget | null>(null);
  const session = useRef<Session | null>(null);
  const didDrag = useRef(false);

  function findDrop(clientX: number, key: string, zone: PinZone): DropTarget | null {
    const frame = frameRef.current;
    if (!frame) return null;
    const frameLeft = frame.getBoundingClientRect().left;
    const cells = [...frame.querySelectorAll<HTMLElement>(`[role="columnheader"][data-zone="${zone}"]`)];
    const rects = cells.map((cell) => cell.getBoundingClientRect());
    const index = rects.findIndex((rect) => clientX < rect.left + rect.width / 2);
    if (index >= 0)
      return {
        key,
        targetKey: cells[index].dataset.col!,
        placeAfter: false,
        x: (rects[index].left - frameLeft) / remPx,
      };
    const last = cells.length - 1;
    return { key, targetKey: cells[last].dataset.col!, placeAfter: true, x: (rects[last].right - frameLeft) / remPx };
  }

  function end(shouldCommit: boolean) {
    const current = session.current;
    session.current = null;
    setDrop(null);
    if (!current?.drop) return;
    didDrag.current = true;
    const { key, targetKey, placeAfter } = current.drop;
    if (shouldCommit) onMove(key, targetKey, placeAfter);
  }

  function getDragProps(key: string, zone: PinZone) {
    return {
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (event.button !== 0) return;
        didDrag.current = false;
        event.currentTarget.setPointerCapture(event.pointerId);
        session.current = { key, zone, startX: event.clientX, drop: null };
      },
      onPointerMove(event: PointerEvent<HTMLElement>) {
        const current = session.current;
        if (!current) return;
        if (!current.drop && Math.abs(event.clientX - current.startX) < DRAG_THRESHOLD_PX) return;
        current.drop = findDrop(event.clientX, current.key, current.zone);
        setDrop(current.drop);
      },
      onPointerUp: () => end(true),
      onPointerCancel: () => end(false),
    };
  }

  function consumeDrag() {
    const wasDragged = didDrag.current;
    didDrag.current = false;
    return wasDragged;
  }

  return { drop, getDragProps, consumeDrag };
}
