import HttpClient from "@/util/http-client/fetch-client.util";

export type StaffRole = "ADMIN" | "COLLABORATOR";
export interface StaffUser {
  id: string;
  invitationId: string | null;
  userId: string | null;
  name: string;
  email: string;
  role: StaffRole;
  status: "ACTIVE" | "PENDING" | "SENDING" | "SENT" | "FAILED" | "ACCEPTED";
  lastSentAt: string | null;
}
export interface StaffUsersPage {
  data: StaffUser[];
  total: number;
  page: number;
  limit: number;
}
export const listStaffUsers = (page: number, limit: number) =>
  HttpClient.fetch<StaffUsersPage>(
    `/admin/users?page=${page}&limit=${limit}`,
    { cache: "no-store" },
    false,
  );

export const inviteStaffUser = (data: {
  name: string;
  email: string;
  role: StaffRole;
}) =>
  HttpClient.fetch<{ id: string; message: string }>(
    "/admin/users/invitations",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    false,
  );

export const resendStaffInvitation = (id: string) =>
  HttpClient.fetch<{ id: string; message: string }>(
    `/admin/users/invitations/${encodeURIComponent(id)}/resend`,
    { method: "POST" },
    false,
  );

export const acceptStaffInvitation = (accessToken: string, password: string) =>
  HttpClient.fetch<{ message: string }>(
    "/staff-invitations/accept",
    {
      method: "POST",
      credentials: "omit",
      body: JSON.stringify({ accessToken, password }),
    },
    false,
  );
