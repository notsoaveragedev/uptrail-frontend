import { ACCOUNT_ORGANIZATIONS, SESSIONS } from "./account";
import { API_KEYS } from "./apiKeys";
import { AUDIT_EVENTS } from "./auditLog";
import { createCollectionStore } from "./collectionStore";
import { MAINTENANCE_WINDOWS } from "./maintenance";
import { NOTIFICATIONS } from "./notifications";
import { PROJECTS } from "./projects";
import { INVITATIONS, MEMBERS, ROLES } from "./team";

export const roleStore = createCollectionStore(ROLES);
export const memberStore = createCollectionStore(MEMBERS);
export const invitationStore = createCollectionStore(INVITATIONS);
export const apiKeyStore = createCollectionStore(API_KEYS);
export const auditStore = createCollectionStore(AUDIT_EVENTS);
export const projectStore = createCollectionStore(PROJECTS);
export const maintenanceStore = createCollectionStore(MAINTENANCE_WINDOWS);
export const notificationStore = createCollectionStore(NOTIFICATIONS);
export const sessionStore = createCollectionStore(SESSIONS);
export const accountOrgStore = createCollectionStore(ACCOUNT_ORGANIZATIONS);
