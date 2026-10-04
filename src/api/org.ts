import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { accountOrgStore } from "@/mocks/settingsStore";
import { ORG_SETTINGS, TAKEN_ORG_SLUGS } from "@/mocks/workspace";
import type { OrgSettings } from "@/types/workspace";

let settings = ORG_SETTINGS;

function orgSettingsKey(orgSlug: string) {
  return ["org-settings", orgSlug] as const;
}

export function orgSettingsQuery(orgSlug: string) {
  return queryOptions({
    queryKey: orgSettingsKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(300);
      return settings;
    },
  });
}

export function slugAvailabilityQuery(slug: string, currentSlug: string) {
  return queryOptions({
    queryKey: ["org-slug", slug],
    queryFn: async () => {
      await fakeRequest(450);
      const isUsed = accountOrgStore.list().some((org) => org.slug === slug);
      return slug === currentSlug || (!TAKEN_ORG_SLUGS.includes(slug) && !isUsed);
    },
    enabled: slug.length >= 3 && slug !== currentSlug,
    staleTime: 30_000,
  });
}

export function useSaveOrgSettings(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (next: OrgSettings) => {
      await fakeRequest(600);
      settings = next;
      return next;
    },
    onSuccess: (next) => queryClient.setQueryData(orgSettingsKey(orgSlug), next),
  });
}
