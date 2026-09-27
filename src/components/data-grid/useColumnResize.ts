import { type PointerEvent, type RefObject, useRef, useState } from "react";
import { clampWidth, type PinZone } from "@/lib/dataGrid";

export type ResizeTarget = { key: string; width: number; minWidth: number; zone: PinZone };

type ResizeDraft = { key: string; width: number; lineX: number };

type Session = { target: ResizeTarget; startX: number; anchorX: number; direction: 1 | -1 };

type Options = {
  frameRef: RefObject<HTMLElement | null>;
  remPx: number;
  onCommit: (key: string, width: number) => void;
  onAutoFit: (target: ResizeTarget) => void;
};

export function useColumnResize({ frameRef, remPx, onCommit, onAutoFit }: Options) {
  const [draft, setDraft] = useState<ResizeDraft | null>(null);
  const session = useRef<Session | null>(null);

  function draftAt(clientX: number, current: Session): ResizeDraft {
    const delta = ((clientX - current.startX) / remPx) * current.direction;
    const width = clampWidth(current.target.width + delta, current.target.minWidth);
    const lineX = (current.anchorX + current.direction * width * remPx) / remPx;
    return { key: current.target.key, width, lineX };
  }

  function finish(shouldCommit: boolean) {
    const current = session.current;
    session.current = null;
    if (shouldCommit && current && draft && draft.width !== current.target.width) onCommit(draft.key, draft.width);
    setDraft(null);
  }

  function getHandleProps(target: ResizeTarget) {
    return {
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        const cell = event.currentTarget.parentElement!.getBoundingClientRect();
        const frameLeft = frameRef.current?.getBoundingClientRect().left ?? 0;
        const direction = target.zone === "right" ? -1 : 1;
        const anchorX = (direction === 1 ? cell.left : cell.right) - frameLeft;
        session.current = { target, startX: event.clientX, anchorX, direction };
        setDraft(draftAt(event.clientX, session.current));
      },
      onPointerMove(event: PointerEvent<HTMLElement>) {
        if (session.current) setDraft(draftAt(event.clientX, session.current));
      },
      onPointerUp: () => finish(true),
      onPointerCancel: () => finish(false),
      onDoubleClick: () => onAutoFit(target),
    };
  }

  return { draft, getHandleProps };
}
