import { accountOrgStore } from "@/mocks/settingsStore";
import { readJson, writeJson } from "./storage";

const LAST_ORG_KEY = "uptrail:last-org";

export function findOrganization(orgSlug: string) {
  const organizations = accountOrgStore.list();
  return organizations.find((org) => org.slug === orgSlug) ?? organizations[0];
}

export function rememberOrg(orgSlug: string) {
  writeJson(LAST_ORG_KEY, orgSlug);
}

export function lastOrg() {
  return findOrganization(readJson<string>(LAST_ORG_KEY, ""));
}
