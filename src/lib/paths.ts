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
  alerts: (orgSlug: string) => `${overview(orgSlug)}/alerts`,
};
