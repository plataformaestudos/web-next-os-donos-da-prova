"use client";

import { useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import {
  inviteStaffUser,
  listStaffUsers,
  resendStaffInvitation,
  staffErrorMessage,
  StaffRole,
  StaffUser,
} from "./staff-users.api";

const adminRoles = [Roles.ADMIN];
const roleLabels: Record<StaffRole, string> = {
  ADMIN: "Administrador",
  COLLABORATOR: "Editor (colaborador)",
};
const statuses: Record<StaffUser["status"], { text: string; color: string }> = {
  ACTIVE: { text: "Ativo", color: "green" },
  ACCEPTED: { text: "Ativo", color: "green" },
  PENDING: { text: "Convite pendente", color: "default" },
  SENDING: { text: "Enviando link", color: "blue" },
  SENT: { text: "Aguardando definição de senha", color: "gold" },
  FAILED: { text: "Falha no convite — reenviar", color: "red" },
};

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
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<{
    name: string;
    email: string;
    role: StaffRole;
  }>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const queryKey = ["staff-users", userId];
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: [...queryKey, page, limit],
    queryFn: () => listStaffUsers(page, limit),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const invite = async (values: {
    name: string;
    email: string;
    role: StaffRole;
  }) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const result = await inviteStaffUser(values);
      message.success(result.message);
      form.resetFields();
      setPage(1);
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

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%", padding: 20 }}
    >
      <Typography.Title level={2}>Gerenciar usuários</Typography.Title>
      <Card title="Convidar usuário">
        <Typography.Paragraph>
          Administradores e editores têm acesso sem assinatura. O convidado
          recebe um link por e-mail para definir a própria senha.
        </Typography.Paragraph>
        {formError && (
          <Alert
            type="error"
            showIcon
            message={formError}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={invite}
          initialValues={{ role: "COLLABORATOR" }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="name"
            label="Nome"
            rules={[
              {
                required: true,
                whitespace: true,
                min: 2,
                max: 100,
                message: "Informe o nome (2 a 100 caracteres).",
              },
            ]}
          >
            <Input maxLength={100} autoComplete="name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              {
                required: true,
                type: "email",
                max: 200,
                message: "Informe um e-mail válido.",
              },
            ]}
          >
            <Input maxLength={200} autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Tipo de acesso"
            rules={[{ required: true }]}
          >
            <Select
              options={Object.entries(roleLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={submitting}>
            Enviar convite
          </Button>
        </Form>
      </Card>
      <Card
        title="Administradores e editores"
        extra={
          <Button onClick={() => void refetch()} loading={isFetching}>
            Atualizar
          </Button>
        }
      >
        {error && (
          <Alert
            type="error"
            message="Não foi possível atualizar a lista de usuários."
            description={staffErrorMessage(error)}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Table<StaffUser>
          rowKey="id"
          loading={isFetching}
          dataSource={data?.data || []}
          scroll={{ x: 760 }}
          locale={{
            emptyText: "Nenhum administrador, editor ou convite encontrado.",
          }}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.total || 0,
            showSizeChanger: true,
            onChange: (nextPage, nextLimit) => {
              setPage(nextLimit === limit ? nextPage : 1);
              setLimit(nextLimit);
            },
          }}
          columns={[
            { title: "Nome", dataIndex: "name" },
            { title: "E-mail", dataIndex: "email" },
            {
              title: "Acesso",
              dataIndex: "role",
              render: (role: StaffRole) => roleLabels[role],
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
              render: (_, row) =>
                row.invitationId &&
                !["ACTIVE", "ACCEPTED"].includes(row.status) ? (
                  <Button
                    loading={sending === row.invitationId}
                    disabled={Boolean(sending || submitting)}
                    onClick={() => void resend(row.invitationId!)}
                  >
                    Reenviar link
                  </Button>
                ) : (
                  "—"
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
    </Space>
  );
}
