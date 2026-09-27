import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { alertChannelStore, alertEventStore, alertRuleStore } from "@/mocks/alertStore";
import { currentUser } from "@/mocks/workspace";
import type { AlertChannel, AlertEvent, AlertRule } from "@/types/alerts";
import { useCollectionMutation } from "./optimistic";

export function alertRulesKey(orgSlug: string) {
  return ["alert-rules", orgSlug] as const;
}

export function alertChannelsKey(orgSlug: string) {
  return ["alert-channels", orgSlug] as const;
}

export function alertEventsKey(orgSlug: string) {
  return ["alert-events", orgSlug] as const;
}

export function alertRulesQuery(orgSlug: string) {
  return queryOptions({
    queryKey: alertRulesKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(350);
      return alertRuleStore.list();
    },
  });
}

export function alertRuleQuery(orgSlug: string, ruleId: string) {
  return queryOptions({
    queryKey: [...alertRulesKey(orgSlug), ruleId],
    queryFn: async () => {
      await fakeRequest(300);
      return alertRuleStore.get(ruleId);
    },
  });
}

export function alertChannelsQuery(orgSlug: string) {
  return queryOptions({
    queryKey: alertChannelsKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(300);
      return alertChannelStore.list();
    },
  });
}

export function alertEventsQuery(orgSlug: string) {
  return queryOptions({
    queryKey: alertEventsKey(orgSlug),
    queryFn: async () => {
      await fakeRequest(400);
      return alertEventStore.list();
    },
  });
}

export function useToggleAlertRule(orgSlug: string) {
  return useCollectionMutation<AlertRule, { id: string; enabled: boolean }>({
    queryKey: alertRulesKey(orgSlug),
    apply: (rules, { id, enabled }) => rules.map((rule) => (rule.id === id ? { ...rule, enabled } : rule)),
    commit: ({ id, enabled }) => {
      const rule = alertRuleStore.get(id);
      if (rule) alertRuleStore.upsert({ ...rule, enabled });
    },
  });
}

export function useDeleteAlertRule(orgSlug: string) {
  return useCollectionMutation<AlertRule, string>({
    queryKey: alertRulesKey(orgSlug),
    apply: (rules, id) => rules.filter((rule) => rule.id !== id),
    commit: (id) => alertRuleStore.remove(id),
  });
}

export function useRestoreAlertRule(orgSlug: string) {
  return useCollectionMutation<AlertRule, AlertRule>({
    queryKey: alertRulesKey(orgSlug),
    apply: (rules, rule) => [rule, ...rules.filter((item) => item.id !== rule.id)],
    commit: (rule) => alertRuleStore.upsert(rule),
  });
}

export function useSaveAlertRule(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: AlertRule) => {
      await fakeRequest(500);
      const saved = { ...rule, updatedAt: Date.now() };
      alertRuleStore.upsert(saved);
      return saved;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(alertRuleQuery(orgSlug, saved.id).queryKey, saved);
      queryClient.invalidateQueries({ queryKey: alertRulesKey(orgSlug), exact: true });
    },
  });
}

export function useSaveAlertChannel(orgSlug: string) {
  return useCollectionMutation<AlertChannel, AlertChannel>({
    queryKey: alertChannelsKey(orgSlug),
    apply: (channels, channel) =>
      channels.some((item) => item.id === channel.id)
        ? channels.map((item) => (item.id === channel.id ? channel : item))
        : [...channels, channel],
    commit: (channel) => alertChannelStore.upsert(channel),
  });
}

export function useDeleteAlertChannel(orgSlug: string) {
  return useCollectionMutation<AlertChannel, string>({
    queryKey: alertChannelsKey(orgSlug),
    apply: (channels, id) => channels.filter((channel) => channel.id !== id),
    commit: (id) => alertChannelStore.remove(id),
  });
}

export async function sendTestMessage(channel: AlertChannel) {
  await fakeRequest(900);
  const ok = !/fail|invalid/i.test(channel.target);
  if (ok && alertChannelStore.get(channel.id))
    alertChannelStore.upsert({ ...channel, verified: true, lastTestAt: Date.now() });
  return ok
    ? { ok: true, message: `Test message delivered to ${channel.name}.` }
    : { ok: false, message: "The endpoint returned 404 Not Found." };
}

export function useAcknowledgeAlert(orgSlug: string) {
  return useCollectionMutation<AlertEvent, string>({
    queryKey: alertEventsKey(orgSlug),
    apply: (events, id) =>
      events.map((event) =>
        event.id === id ? { ...event, acknowledgedBy: currentUser.name, acknowledgedAt: Date.now() } : event,
      ),
    commit: (id) => {
      const event = alertEventStore.get(id);
      if (event) alertEventStore.upsert({ ...event, acknowledgedBy: currentUser.name, acknowledgedAt: Date.now() });
    },
  });
}
