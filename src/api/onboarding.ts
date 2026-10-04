import { useMutation, useQueryClient } from "@tanstack/react-query";
import { newOrganization } from "@/lib/account";
import { fakeRequest } from "@/lib/fakeRequest";
import { newId } from "@/lib/ids";
import { DEFAULT_VALUES } from "@/lib/monitorForm";
import { isIncluded, type OnboardingDraft } from "@/lib/onboarding";
import { newProject } from "@/lib/projects";
import { blankStatusPage } from "@/lib/statusPages";
import { alertChannelStore } from "@/mocks/alertStore";
import { createdMonitor } from "@/mocks/monitorFactory";
import { accountOrgStore, projectStore } from "@/mocks/settingsStore";
import { statusPageStore } from "@/mocks/statusPageStore";
import { addMonitors } from "./monitors";

export function useFinishOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: OnboardingDraft) => {
      await fakeRequest(900);
      const orgSlug = draft.organization.slug;
      const project = newProject({ ...draft.project, description: "", tags: [] });
      const monitors = isIncluded(draft, "monitor")
        ? [
            createdMonitor({
              ...DEFAULT_VALUES,
              name: draft.monitor.name,
              url: draft.monitor.url,
              intervalSec: draft.monitor.intervalSec,
              project: project.slug,
            }),
          ]
        : [];
      accountOrgStore.upsert(newOrganization(draft.organization.name, orgSlug));
      projectStore.upsert(project);
      if (monitors.length) await addMonitors(queryClient, orgSlug, monitors);
      if (isIncluded(draft, "alerts")) {
        alertChannelStore.upsert({
          id: newId("ch"),
          type: "email",
          name: "Team email",
          target: draft.alerts.email,
          verified: true,
          lastTestAt: null,
        });
      }
      if (isIncluded(draft, "alerts") && draft.alerts.slackUrl) {
        alertChannelStore.upsert({
          id: newId("ch"),
          type: "slack",
          name: "Slack alerts",
          target: draft.alerts.slackUrl,
          verified: false,
          lastTestAt: null,
        });
      }
      if (draft.statusPage.isEnabled) {
        statusPageStore.upsert(
          blankStatusPage(
            { project: project.slug, title: draft.statusPage.title, slug: draft.statusPage.slug },
            monitors,
          ),
        );
      }
      await queryClient.invalidateQueries();
      return orgSlug;
    },
  });
}
