import { createClient } from "./supabase/server";

// function parseJwt(token?: string) {
//   if (!token) {
//     return;
//   }
//   const base64Url = token.split(".")[1];
//   const base64 = base64Url.replace("-", "+").replace("_", "/");
//   return JSON.parse(Buffer.from(base64, "base64").toString("ascii"));
// }

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

export async function verify(roles: Roles[]) {
  const supabase = await createClient();
  const session = (await supabase.auth.getSession())?.data.session;
  if (session?.user?.id) {
    const userProfile = await supabase
      .from("profiles")
      .select("role_id")
      .match({ user_id: session.user.id })
      .single();

    return roles.some((role) => userProfile.data?.role_id === ROLES_IDS[role]);
  } else {
    return false;
  }
}
