export const DEFAULT_APP_PATH = "/o/pixelcraft";

export function safeRedirect(next: string | null) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : DEFAULT_APP_PATH;
}
