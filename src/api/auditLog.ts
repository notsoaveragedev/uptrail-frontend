import { queryOptions } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { auditStore } from "@/mocks/settingsStore";

export function auditLogQuery(orgSlug: string) {
  return queryOptions({
    queryKey: ["audit-log", orgSlug],
    queryFn: async () => {
      await fakeRequest(450);
      return auditStore.list();
    },
  });
}
