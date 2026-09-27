import { useEffect, useRef } from "react";
import { useBlocker } from "react-router";
import { useConfirm } from "./useConfirm";

type GuardOptions = {
  isDirty: boolean;
  title: string;
  description: string;
};

export function useUnsavedChangesGuard({ isDirty, title, description }: GuardOptions) {
  const confirm = useConfirm();
  const isAllowedRef = useRef(false);
  const isAskingRef = useRef(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !isAllowedRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== "blocked" || isAskingRef.current) return;
    isAskingRef.current = true;
    confirm({ title, description, confirmLabel: "Leave", isDanger: true }).then((shouldLeave) => {
      isAskingRef.current = false;
      if (shouldLeave) blocker.proceed();
      else blocker.reset();
    });
  }, [blocker, confirm, title, description]);

  return {
    allowLeave: () => {
      isAllowedRef.current = true;
    },
  };
}
