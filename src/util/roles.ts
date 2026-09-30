import type { UserExtended } from "@/app/context/user.context";

export enum Roles {
  ADMIN = "ADMIN",
  COLLABORATOR = "COLLABORATOR",
  STUDENT = "STUDENT",
}

const ROLES_IDS = {
  [Roles.ADMIN]: "ebacbfdf-547f-46c7-a31d-8e83225994b7",
  [Roles.COLLABORATOR]: "8756e86c-a51f-418e-ac9a-8d37fff454b0",
  [Roles.STUDENT]: "8f36e1ce-e12e-4237-b16b-4ad7723d8f2b",
} as const;


export function canAccess(user: UserExtended | null, roles: Roles[]) {
  if (!user?.profile) return false;

  return roles.some(
    (role) => user.profile?.role_id === ROLES_IDS[role]
  );
}

export function hasStaffAccess(user: UserExtended | null) {
  return canAccess(user, [Roles.ADMIN, Roles.COLLABORATOR]);
}
