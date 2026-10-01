import { useId, useLayoutEffect, useState } from "react";
import { useRowDrag } from "@/hooks/useRowDrag";
import {
  componentGripId,
  componentPosition,
  groupOfComponent,
  moveComponentBy,
  moveComponentTo,
} from "@/lib/statusPages";
import type { StatusComponentConfig, StatusPage } from "@/types/statusPage";

function positionText(page: StatusPage, groupId: string, monitorId: string) {
  const { index, count } = componentPosition(page, groupId, monitorId);
  return `position ${index + 1} of ${count}`;
}

export function useComponentReorder(page: StatusPage, onChange: (page: StatusPage) => void) {
  const instructionsId = useId();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const { draggingId, startDrag } = useRowDrag((monitorId, index) => {
    const group = groupOfComponent(page, monitorId);
    if (group && componentPosition(page, group.id, monitorId).index !== index) {
      onChange(moveComponentTo(page, group.id, monitorId, index));
    }
  });

  useLayoutEffect(() => {
    if (pickedId) document.getElementById(componentGripId(pickedId))?.focus();
  }, [page, pickedId]);

  function togglePick(groupId: string, item: StatusComponentConfig) {
    const isDropping = pickedId === item.monitorId;
    const position = positionText(page, groupId, item.monitorId);
    setPickedId(isDropping ? null : item.monitorId);
    setAnnouncement(
      isDropping
        ? `Dropped ${item.displayName} at ${position}.`
        : `Picked up ${item.displayName}, ${position}. Use the arrow keys to move it and Space to drop.`,
    );
  }

  function moveBy(groupId: string, item: StatusComponentConfig, offset: number) {
    const next = moveComponentBy(page, groupId, item.monitorId, offset);
    onChange(next);
    setAnnouncement(`Moved ${item.displayName} to ${positionText(next, groupId, item.monitorId)}.`);
  }

  return { instructionsId, pickedId, draggingId, announcement, startDrag, togglePick, moveBy };
}

export type ComponentReorder = ReturnType<typeof useComponentReorder>;
