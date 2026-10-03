export type ProjectOverride = { project: string; roleId: string };

export type Member = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  projectOverrides: ProjectOverride[];
  joinedAt: number;
  lastActiveAt: number;
};

export type Invitation = {
  id: string;
  email: string;
  roleId: string;
  invitedBy: string;
  createdAt: number;
  expiresAt: number;
};
