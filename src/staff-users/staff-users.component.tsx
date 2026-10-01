"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Dropdown,
  Flex,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import {
  inviteStaffUser,
  listStaffUsers,
  resendStaffInvitation,
  staffErrorMessage,
  updateStaffUser,
  StaffRole,
  StaffUser,
  StaffUsersFilters,
  UserRole,
  setStudentAccess,
  resetStudentPassword,
  removeStudent,
} from "./staff-users.api";
import { roleLabels, statuses } from "./staff-users.constants";
import { StaffUsersFilterForm } from "./staff-users-filters.component";
import { StaffUserDialog, UserFormValues } from "./staff-user-dialog.component";

const adminRoles = [Roles.ADMIN];

export function StaffUsers() {
  const { loading, allowed, user } = useAuthGuard({
    requireRoles: adminRoles,
    redirectOnForbidden: "/home",
  });
  if (loading) return <FullPageLoading />;
  return allowed ? (
    <StaffUsersContent key={user?.id} userId={user!.id} />
  ) : null;
}

function StaffUsersContent({ userId }: { userId: string }) {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState<StaffUsersFilters>({});
  const [dialog, setDialog] = useState<{
    user: StaffUser | null;
    key: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [studentAction, setStudentAction] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const queryKey = ["staff-users", userId];
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: [...queryKey, page, limit, filters],
    queryFn: () => listStaffUsers(page, limit, filters),
  });
  useEffect(() => {
    if (!data || isFetching) return;
    const lastPage = Math.max(1, Math.ceil(data.total / limit));
    if (page > lastPage) setPage(lastPage);
  }, [data, isFetching, limit, page]);
  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const openDialog = (user: StaffUser | null) => {
    setFormError(null);
    setDialog({ user, key: Date.now() });
  };
  const closeDialog = () => {
    if (submitting) return;
    setDialog(null);
    setFormError(null);
  };
  const save = async (values: UserFormValues) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const result = dialog?.user
        ? await updateStaffUser(dialog.user.id, {
            name: values.name.trim(),
            doc: values.doc?.trim() || "",
            role: values.role,
          })
        : await inviteStaffUser({
            name: values.name.trim(),
            email: values.email.trim(),
            doc: values.doc?.trim() || "",
            role: values.role as StaffRole,
          });
      message.success(result.message);
      if (!dialog?.user) setPage(1);
      setDialog(null);
    } catch (error) {
      setFormError(staffErrorMessage(error));
    } finally {
      setSubmitting(false);
      // Failed delivery can still leave a recoverable invitation in the list.
      await refresh();
    }
  };
  const resend = async (id: string) => {
    setSending(id);
    try {
      const result = await resendStaffInvitation(id);
      message.success(result.message);
    } catch (error) {
      message.error(staffErrorMessage(error));
    } finally {
      setSending(null);
      await refresh();
    }
  };

  const confirmStudentAction = (
    row: StaffUser,
    action: "access" | "password" | "delete",
  ) => {
    if (!row.userId) return;
    const blocked = row.status === "BLOCKED";
    const title =
      action === "delete"
        ? "Excluir usuário?"
        : action === "password"
          ? "Enviar link de redefinição de senha?"
          : blocked
            ? "Desbloquear acesso?"
            : "Bloquear acesso?";
    modal.confirm({
      title,
      content: (
        <Space direction="vertical">
          <Typography.Text strong>
            {row.name} — {row.email}
          </Typography.Text>
          <Typography.Text>
            {action === "delete"
              ? "Será utilizado o mesmo fluxo de exclusão disponível ao aluno: anonimização dos dados pessoais, inativação das assinaturas no sistema e remoção da conta de autenticação. Esta ação não pode ser desfeita. O fluxo atual não cancela cobranças no provedor automaticamente."
              : action === "password"
                ? "O aluno receberá um link para definir uma nova senha."
                : blocked
                  ? "O aluno poderá entrar novamente na plataforma."
                  : "O aluno não poderá acessar a plataforma. Sua assinatura não será cancelada automaticamente."}
          </Typography.Text>
        </Space>
      ),
      okText: action === "delete" ? "Excluir usuário" : "Confirmar",
      cancelText: "Cancelar",
      okButtonProps: {
        danger: action === "delete" || (action === "access" && !blocked),
      },
      onOk: async () => {
        setStudentAction(row.id);
        try {
          const result =
            action === "delete"
              ? await removeStudent(row.userId!)
              : action === "password"
                ? await resetStudentPassword(row.userId!)
                : await setStudentAccess(row.userId!, !blocked);
          message.success(result.message);
          await refresh();
        } catch (error) {
          message.error(staffErrorMessage(error));
          await refresh();
          throw error;
        } finally {
          setStudentAction(null);
        }
      },
    });
  };

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%", padding: 20 }}
    >
      <Flex justify="space-between" align="center" gap={16} wrap>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Gerenciar usuários
        </Typography.Title>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          disabled={Boolean(sending)}
          onClick={() => openDialog(null)}
        >
          Adicionar usuário
        </Button>
      </Flex>
      <Card
        title="Usuários"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void refetch()}
            loading={isFetching}
          >
            Atualizar
          </Button>
        }
      >
        <StaffUsersFilterForm
          filters={filters}
          onApply={(next) => {
            setFilters(
              Object.fromEntries(
                Object.entries(next).filter(([, value]) => value?.trim()),
              ),
            );
            setPage(1);
          }}
        />
        {error && (
          <Alert
            type="error"
            message="Não foi possível atualizar a lista de usuários."
            description={staffErrorMessage(error)}
            showIcon
            style={{ margin: "16px 0" }}
          />
        )}
        <Table<StaffUser>
          style={{ marginTop: 16 }}
          rowKey="id"
          loading={isFetching}
          dataSource={data?.data || []}
          scroll={{ x: 1100 }}
          locale={{ emptyText: "Nenhum usuário encontrado." }}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => `${total} usuário(s)`,
            onChange: (nextPage, nextLimit) => {
              setPage(nextLimit === limit ? nextPage : 1);
              setLimit(nextLimit);
            },
          }}
          columns={[
            { title: "Nome", dataIndex: "name" },
            {
              title: "E-mail",
              dataIndex: "email",
              render: (email: string | null) => email || "—",
            },
            {
              title: "Documento",
              dataIndex: "doc",
              render: (doc: string) => doc || "—",
            },
            {
              title: "Tipo de acesso",
              dataIndex: "role",
              render: (role: UserRole) => roleLabels[role],
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (status: StaffUser["status"]) => (
                <Tag color={statuses[status].color}>
                  {statuses[status].text}
                </Tag>
              ),
            },
            {
              title: "Último envio",
              dataIndex: "lastSentAt",
              render: (date: string | null) =>
                date ? new Date(date).toLocaleString("pt-BR") : "—",
            },
            {
              title: "Ações",
              fixed: "right",
              render: (_, row) =>
                row.role === "STUDENT" ? (
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      items: [
                        {
                          key: "access",
                          label:
                            row.status === "BLOCKED"
                              ? "Desbloquear acesso"
                              : "Bloquear acesso",
                          onClick: () => confirmStudentAction(row, "access"),
                        },
                        {
                          key: "password",
                          label: "Redefinir senha",
                          disabled: row.status === "BLOCKED",
                          onClick: () => confirmStudentAction(row, "password"),
                        },
                        { type: "divider" },
                        {
                          key: "delete",
                          label: "Excluir usuário",
                          danger: true,
                          onClick: () => confirmStudentAction(row, "delete"),
                        },
                      ],
                    }}
                    disabled={
                      Boolean(studentAction || sending || submitting) ||
                      !row.userId
                    }
                  >
                    <Button loading={studentAction === row.id}>Ações</Button>
                  </Dropdown>
                ) : (
                  <Space wrap>
                    <Button
                      icon={<EditOutlined />}
                      disabled={
                        Boolean(sending || submitting || studentAction)
                      }
                      onClick={() => openDialog(row)}
                    >
                      Editar
                    </Button>
                    {row.invitationId &&
                      !["ACTIVE", "ACCEPTED"].includes(row.status) && (
                        <Button
                          loading={sending === row.invitationId}
                          disabled={Boolean(sending || submitting)}
                          onClick={() => void resend(row.invitationId!)}
                        >
                          Reenviar link
                        </Button>
                      )}
                  </Space>
                ),
            },
          ]}
        />
        <Typography.Paragraph
          type="secondary"
          style={{ marginTop: 12, marginBottom: 0 }}
        >
          O reenvio fica disponível após dois minutos. Links expirados podem ser
          substituídos por um novo envio.
        </Typography.Paragraph>
      </Card>
      {dialog && (
        <StaffUserDialog
          key={dialog.key}
          user={dialog.user}
          open
          submitting={submitting}
          error={formError}
          onCancel={closeDialog}
          onSubmit={save}
        />
      )}
    </Space>
  );
}
