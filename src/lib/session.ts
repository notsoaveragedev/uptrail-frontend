import { MINUTE_MS } from "./dates";
import { readJson, removeStored, writeJson } from "./storage";

export const SESSION_IDLE_MS = 30 * MINUTE_MS;

export const SESSION_WARNING_MS = 2 * MINUTE_MS;

export const ACTIVITY_THROTTLE_MS = MINUTE_MS;

const EXPIRY_KEY = "uptrail:session-expires-at";

const CHANNEL_NAME = "uptrail-session";

export type SessionMessage = { type: "extend"; expiresAt: number } | { type: "signout" };

export function readExpiry() {
  return readJson<number | null>(EXPIRY_KEY, null);
}

export function writeExpiry(expiresAt: number) {
  writeJson(EXPIRY_KEY, expiresAt);
}

export function hasActiveSession() {
  return (readExpiry() ?? 0) > Date.now();
}

export function nextExpiry() {
  return Date.now() + SESSION_IDLE_MS;
}

export function startSession() {
  const expiresAt = nextExpiry();
  writeExpiry(expiresAt);
  broadcastSession({ type: "extend", expiresAt });
}

export function endSession() {
  removeStored(EXPIRY_KEY);
}

export function openSessionChannel() {
  return typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL_NAME);
}

export function broadcastSession(message: SessionMessage) {
  const channel = openSessionChannel();
  channel?.postMessage(message);
  channel?.close();
}

export function formatCountdown(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function signOut() {
  endSession();
  broadcastSession({ type: "signout" });
  window.location.replace("/login");
}
