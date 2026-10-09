import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fakeRequest } from "@/lib/fakeRequest";
import { ACCOUNT, NOTIFICATION_PREFERENCES, SECURITY } from "@/mocks/account";
import { accountOrgStore, sessionStore } from "@/mocks/settingsStore";
import type { Account, AccountOrganization, NotificationPreference, SecurityState } from "@/types/account";
import { useRemoveMutation, useUpsertMutation } from "./optimistic";

let account = ACCOUNT;
let security = SECURITY;
let notificationPreferences = NOTIFICATION_PREFERENCES;

const ACCOUNT_KEY = ["account"] as const;
const SECURITY_KEY = ["account", "security"] as const;
const SESSIONS_KEY = ["account", "sessions"] as const;
const PREFERENCES_KEY = ["account", "notification-preferences"] as const;
const ORGANIZATIONS_KEY = ["account", "organizations"] as const;

export const accountQuery = queryOptions({
  queryKey: ACCOUNT_KEY,
  queryFn: async () => {
    await fakeRequest(250);
    return account;
  },
});

export const securityQuery = queryOptions({
  queryKey: SECURITY_KEY,
  queryFn: async () => {
    await fakeRequest(300);
    return security;
  },
});

export const sessionsQuery = queryOptions({
  queryKey: SESSIONS_KEY,
  queryFn: async () => {
    await fakeRequest(300);
    return sessionStore.list();
  },
});

export const notificationPreferencesQuery = queryOptions({
  queryKey: PREFERENCES_KEY,
  queryFn: async () => {
    await fakeRequest(300);
    return notificationPreferences;
  },
});

export const accountOrganizationsQuery = queryOptions({
  queryKey: ORGANIZATIONS_KEY,
  queryFn: async () => {
    await fakeRequest(300);
    return accountOrgStore.list();
  },
});

function useSaveValue<Value>(queryKey: readonly string[], write: (value: Value) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: Value) => {
      await fakeRequest(500);
      write(value);
      return value;
    },
    onSuccess: (value) => queryClient.setQueryData(queryKey, value),
  });
}

export function useSaveAccount() {
  return useSaveValue<Account>(ACCOUNT_KEY, (value) => {
    account = value;
  });
}

export function useSaveSecurity() {
  return useSaveValue<SecurityState>(SECURITY_KEY, (value) => {
    security = value;
  });
}

export function useSaveNotificationPreferences() {
  return useSaveValue<NotificationPreference[]>(PREFERENCES_KEY, (value) => {
    notificationPreferences = value;
  });
}

export function useRevokeSessions() {
  return useRemoveMutation(SESSIONS_KEY, sessionStore);
}

export function useSaveAccountOrganization() {
  return useUpsertMutation<AccountOrganization>(ORGANIZATIONS_KEY, accountOrgStore);
}

export function useLeaveOrganizations() {
  return useRemoveMutation<AccountOrganization>(ORGANIZATIONS_KEY, accountOrgStore);
}

type EmailConfirmFailure = "expired" | "invalid" | "already_confirmed";

type EmailConfirmResult =
  { ok: true; email: string; previousEmail: string } | { ok: false; reason: EmailConfirmFailure; email: string };

const CONFIRM_FAILURES: Record<string, EmailConfirmFailure> = {
  expired: "expired",
  invalid: "invalid",
  used: "already_confirmed",
};

export function emailConfirmQuery(token: string) {
  return queryOptions({
    queryKey: ["account", "email-confirm", token],
    queryFn: async (): Promise<EmailConfirmResult> => {
      await fakeRequest(900);
      const nextEmail = account.pendingEmail ?? "meera.iyer@pixelcraft.io";
      const failure = token ? CONFIRM_FAILURES[token] : "invalid";
      if (failure)
        return { ok: false, reason: failure, email: failure === "already_confirmed" ? nextEmail : account.email };
      const previousEmail = account.email;
      account = { ...account, email: nextEmail, pendingEmail: null };
      return { ok: true, email: nextEmail, previousEmail };
    },
    staleTime: Infinity,
    retry: false,
  });
}
