import type { StaffUser, UserRole } from "./staff-users.api";

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  COLLABORATOR: "Editor (colaborador)",
  STUDENT: "Aluno",
};

export const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
  value,
  label,
}));
export const inviteRoleOptions = roleOptions.filter(
  ({ value }) => value !== "STUDENT",
);

export const statuses: Record<
  StaffUser["status"],
  { text: string; color: string }
> = {
  ACTIVE: { text: "Ativo", color: "green" },
  BLOCKED: { text: "Bloqueado", color: "red" },
  ACCEPTED: { text: "Ativo", color: "green" },
  PENDING: { text: "Convite pendente", color: "default" },
  SENDING: { text: "Enviando link", color: "blue" },
  SENT: { text: "Aguardando definição de senha", color: "gold" },
  FAILED: { text: "Falha no convite — reenviar", color: "red" },
};

export const statusOptions = Object.entries(statuses)
  .filter(([value]) => value !== "ACCEPTED")
  .map(([value, { text }]) => ({ value, label: text }));
