import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  ACTIVITY_THROTTLE_MS,
  broadcastSession,
  nextExpiry,
  openSessionChannel,
  readExpiry,
  SESSION_WARNING_MS,
  writeExpiry,
  type SessionMessage,
} from "@/lib/session";
import { useNow } from "./useNow";

export type SessionStatus = "active" | "expiring" | "expired" | "signedOut";

function initialExpiry() {
  const preview = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("session") : null;
  if (preview === "warning") return Date.now() + 90_000;
  if (preview === "expired") return Date.now() - 1000;
  return readExpiry() ?? nextExpiry();
}

export function useSessionExpiry() {
  const [expiresAt, setExpiresAt] = useState(initialExpiry);
  const [isSignedOutElsewhere, setIsSignedOutElsewhere] = useState(false);
  const lastActivityRef = useRef(0);
  const now = useNow(1000);
  const remaining = expiresAt - now;
  const status: SessionStatus = isSignedOutElsewhere
    ? "signedOut"
    : remaining <= 0
      ? "expired"
      : remaining <= SESSION_WARNING_MS
        ? "expiring"
        : "active";

  function extend() {
    const next = nextExpiry();
    setExpiresAt(next);
    setIsSignedOutElsewhere(false);
    writeExpiry(next);
    broadcastSession({ type: "extend", expiresAt: next });
  }

  const handleMessage = useEffectEvent((message: SessionMessage) => {
    if (message.type === "signout") return setIsSignedOutElsewhere(true);
    setExpiresAt(message.expiresAt);
    setIsSignedOutElsewhere(false);
  });

  const handleActivity = useEffectEvent(() => {
    if (status !== "active" || Date.now() - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityRef.current = Date.now();
    extend();
  });

  useEffect(() => {
    writeExpiry(expiresAt);
  }, [expiresAt]);

  useEffect(() => {
    const channel = openSessionChannel();
    if (channel) channel.onmessage = (event: MessageEvent<SessionMessage>) => handleMessage(event.data);
    window.addEventListener("pointerdown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    return () => {
      channel?.close();
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, []);

  return { status, remaining, extend };
}
