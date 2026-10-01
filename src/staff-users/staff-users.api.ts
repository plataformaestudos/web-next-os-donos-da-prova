import HttpClient from "@/util/http-client/fetch-client.util";
import { HttpError } from "@/lib/errors";

export function staffErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 401)
      return "Este acesso expirou. Entre novamente ou solicite o reenvio do convite.";
    const detail = (error.data as { message?: unknown } | undefined)?.message;
    if (typeof detail === "string") return detail;
    if (
      Array.isArray(detail) &&
      detail.every((item) => typeof item === "string")
    )
      return detail.join(" ");
  }
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a solicitação.";
}

export type StaffRole = "ADMIN" | "COLLABORATOR";
export type UserRole = StaffRole | "STUDENT";
export interface StaffUser {
  id: string;
  invitationId: string | null;
  userId: string | null;
  name: string;
  email: string;
  role: UserRole;
  doc: string;
  status:
    | "ACTIVE"
    | "BLOCKED"
    | "PENDING"
    | "SENDING"
    | "SENT"
    | "FAILED"
    | "ACCEPTED";
  lastSentAt: string | null;
}
export interface StaffUsersPage {
  data: StaffUser[];
  total: number;
  page: number;
  limit: number;
}
export interface StaffUsersFilters {
  name?: string;
  email?: string;
  doc?: string;
  role?: UserRole;
  status?: StaffUser["status"];
}

export const listStaffUsers = (
  page: number,
  limit: number,
  filters: StaffUsersFilters = {},
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  Object.entries(filters).forEach(([key, value]) => {
    if (value?.trim()) params.set(key, value.trim());
  });
  return HttpClient.fetch<StaffUsersPage>(
    `/admin/users?${params.toString()}`,
    { cache: "no-store" },
    false,
  );
};

export const updateStaffUser = (
  id: string,
  data: {
    name: string;
    doc: string;
    role: StaffRole;
  },
) =>
  HttpClient.fetch<{ message: string }>(
    `/admin/users/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(data) },
    false,
  );

export const setStudentAccess = (id: string, blocked: boolean) =>
  HttpClient.fetch<{ message: string }>(
    `/admin/users/${encodeURIComponent(id)}/access`,
    { method: "POST", body: JSON.stringify({ blocked }) },
    false,
  );

export const resetStudentPassword = (id: string) =>
  HttpClient.fetch<{ message: string }>(
    `/admin/users/${encodeURIComponent(id)}/reset-password`,
    { method: "POST" },
    false,
  );

export const removeStudent = (id: string) =>
  HttpClient.fetch<{ message: string }>(
    `/admin/users/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    false,
  );

export const inviteStaffUser = (data: {
  name: string;
  email: string;
  role: StaffRole;
  doc?: string;
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
