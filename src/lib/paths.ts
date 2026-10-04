type Search = Record<string, string>;

function withSearch(path: string, search?: Search) {
  const query = new URLSearchParams(search).toString();
  return query ? `${path}?${query}` : path;
}

function overview(orgSlug: string) {
  return `/o/${orgSlug}`;
}

export const paths = {
  overview,
  section: (orgSlug: string, section: string) => (section ? `${overview(orgSlug)}/${section}` : overview(orgSlug)),
  monitors: (orgSlug: string, search?: Search) => withSearch(`${overview(orgSlug)}/monitors`, search),
  monitor: (orgSlug: string, monitorId: string) => `${overview(orgSlug)}/monitors/${monitorId}`,
  monitorEdit: (orgSlug: string, monitorId: string) => `${overview(orgSlug)}/monitors/${monitorId}/edit`,
  monitorNew: (orgSlug: string) => `${overview(orgSlug)}/monitors/new`,
  monitorImport: (orgSlug: string) => `${overview(orgSlug)}/monitors/import`,
  logs: (orgSlug: string, search?: Search) => withSearch(`${overview(orgSlug)}/logs`, search),
  incidents: (orgSlug: string) => `${overview(orgSlug)}/incidents`,
  incident: (orgSlug: string, incidentId: string) => `${overview(orgSlug)}/incidents/${incidentId}`,
  incidentsList: (orgSlug: string, search?: Search) => withSearch(`${overview(orgSlug)}/incidents`, search),
  statusPages: (orgSlug: string) => `${overview(orgSlug)}/status-pages`,
  statusPageEdit: (orgSlug: string, pageId: string) => `${overview(orgSlug)}/status-pages/${pageId}/edit`,
  publicStatus: (slug: string) => `/status/${slug}`,
  publicIncident: (slug: string, incidentId: string) => `/status/${slug}/incidents/${incidentId}`,
  publicSubscribeConfirm: (slug: string, token: string) => `/status/${slug}/subscribe/confirm?token=${token}`,
  publicUnsubscribe: (slug: string, token: string) => `/status/${slug}/unsubscribe?token=${token}`,
  alerts: (orgSlug: string) => `${overview(orgSlug)}/alerts`,
  alertRules: (orgSlug: string, search?: Search) => withSearch(`${overview(orgSlug)}/alerts/rules`, search),
  alertRuleNew: (orgSlug: string) => `${overview(orgSlug)}/alerts/rules/new`,
  alertRule: (orgSlug: string, ruleId: string) => `${overview(orgSlug)}/alerts/rules/${ruleId}`,
  alertChannels: (orgSlug: string) => `${overview(orgSlug)}/alerts/channels`,
  alertHistory: (orgSlug: string, search?: Search) => withSearch(`${overview(orgSlug)}/alerts/history`, search),
  dashboards: (orgSlug: string) => `${overview(orgSlug)}/dashboards`,
  dashboard: (orgSlug: string, dashboardId: string, search?: Search) =>
    withSearch(`${overview(orgSlug)}/dashboards/${dashboardId}`, search),
  dashboardTv: (orgSlug: string, dashboardId: string) => `${overview(orgSlug)}/dashboards/${dashboardId}/tv`,
  projects: (orgSlug: string, search?: Search) => withSearch(`${overview(orgSlug)}/projects`, search),
  project: (orgSlug: string, projectSlug: string, tab = "overview") =>
    `${overview(orgSlug)}/projects/${projectSlug}${tab === "overview" ? "" : `/${tab}`}`,
  maintenance: (orgSlug: string, search?: Search) => withSearch(`${overview(orgSlug)}/maintenance`, search),
  notifications: (orgSlug: string) => `${overview(orgSlug)}/notifications`,
  settings: (orgSlug: string, page = "general", search?: Search) =>
    withSearch(`${overview(orgSlug)}/settings/${page}`, search),
  role: (orgSlug: string, roleId: string) => `${overview(orgSlug)}/settings/roles/${roleId}`,
  account: (page = "profile") => `/account/${page}`,
};
