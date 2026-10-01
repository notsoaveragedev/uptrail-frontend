import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { hashString } from "@/mocks/random";
import { incidentStore } from "@/mocks/incidentStore";
import { monitorStore } from "@/mocks/monitorStore";
import { statusPageStore, statusSubscriberStore } from "@/mocks/statusPageStore";
import { buildStatusSnapshot } from "@/mocks/statusSnapshot";
import type { StatusSnapshot } from "@/types/statusPage";

export type SnapshotResponse = { status: 200; etag: string; snapshot: StatusSnapshot } | { status: 304 };

const POLL_INTERVAL_MS = 30_000;

function fetchSnapshot(slug: string, etag: string | null): SnapshotResponse {
  const page = statusPageStore.list().find((item) => item.slug === slug && item.published);
  if (!page) throw new Response("Status page not found", { status: 404 });
  const snapshot = buildStatusSnapshot(page, monitorStore.list(), incidentStore.list());
  const nextEtag = `"${hashString(JSON.stringify({ ...snapshot, generatedAt: 0 })).toString(36)}"`;
  return nextEtag === etag ? { status: 304 } : { status: 200, etag: nextEtag, snapshot };
}

export function publicStatusQuery(slug: string) {
  let etag: string | null = null;
  let latest: StatusSnapshot | null = null;

  return queryOptions({
    queryKey: ["public-status", slug],
    queryFn: async () => {
      await fakeRequest(250);
      const response = fetchSnapshot(slug, etag);
      if (response.status === 200) {
        etag = response.etag;
        latest = response.snapshot;
      }
      return { snapshot: latest!, notModified: response.status === 304, checkedAt: Date.now() };
    },
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    retry: 2,
  });
}

export async function subscribeToStatus(slug: string, email: string) {
  await fakeRequest(600);
  const page = statusPageStore.list().find((item) => item.slug === slug);
  if (!page) throw new Error("Status page not found");
  statusSubscriberStore.upsert({
    id: `sub_${Date.now()}`,
    pageId: page.id,
    email,
    confirmed: false,
    createdAt: Date.now(),
  });
}

export async function confirmSubscription(token: string) {
  await fakeRequest(500);
  if (token === "expired") return { ok: false as const, reason: "expired" as const };
  if (!token || token === "invalid") return { ok: false as const, reason: "invalid" as const };
  return { ok: true as const };
}

export async function unsubscribe(token: string) {
  await fakeRequest(400);
  return Boolean(token);
}
