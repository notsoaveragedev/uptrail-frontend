import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { isInsideDialog, isTypingTarget } from "@/lib/dom";
import { paths } from "@/lib/paths";
import { GO_TO_WINDOW_MS, goToTarget } from "@/lib/shortcuts";
import { useCurrentRole } from "./usePermission";
import { useWindowKeydown } from "./useWindowKeydown";

export function useGlobalShortcuts(onShowShortcuts: () => void) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();
  const { granted } = useCurrentRole();
  const goPressedAt = useRef(0);

  useWindowKeydown((event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
    if (isTypingTarget(event.target) || isInsideDialog(event.target)) return;

    const key = event.key.toLowerCase();
    const isGoSequence = event.timeStamp - goPressedAt.current < GO_TO_WINDOW_MS;
    goPressedAt.current = 0;

    if (isGoSequence) {
      const item = goToTarget(key, granted);
      if (!item) return;
      event.preventDefault();
      navigate(paths.section(orgSlug, item.path));
    } else if (key === "g") {
      goPressedAt.current = event.timeStamp;
    } else if (event.key === "?") {
      event.preventDefault();
      onShowShortcuts();
    } else if (key === "c" && granted.has("monitor:create")) {
      event.preventDefault();
      navigate(paths.monitorNew(orgSlug));
    }
  });
}
