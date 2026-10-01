"use client";

import { Alert, Form, Input, Modal, Select, Typography } from "antd";
import type { StaffRole, StaffUser } from "./staff-users.api";
import { inviteRoleOptions, statuses } from "./staff-users.constants";

export interface UserFormValues {
  name: string;
  email: string;
  doc: string;
  role: StaffRole;
}

export function StaffUserDialog({
  user,
  open,
  submitting,
  error,
  onCancel,
  onSubmit,
}: {
  user: StaffUser | null;
  open: boolean;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}) {
  const [form] = Form.useForm<UserFormValues>();
  const editing = Boolean(user);
  return (
    <Modal
      title={editing ? "Editar usuário" : "Adicionar usuário"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={editing ? "Salvar alterações" : "Enviar convite"}
      cancelText="Cancelar"
      confirmLoading={submitting}
      closable={!submitting}
      maskClosable={!submitting}
      keyboard={!submitting}
      cancelButtonProps={{ disabled: submitting }}
    >
      {editing ? (
        <Typography.Paragraph type="secondary">
          E-mail e status são somente leitura. O status é atualizado pelo fluxo
          de convite.
        </Typography.Paragraph>
      ) : (
        <Typography.Paragraph>
          Administradores e editores têm acesso sem assinatura. O usuário
          receberá um link por e-mail para definir a própria senha.
        </Typography.Paragraph>
      )}
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        disabled={submitting}
        onFinish={onSubmit}
        initialValues={
          user || { role: "COLLABORATOR" satisfies StaffRole, doc: "" }
        }
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
          rules={
            editing
              ? []
              : [
                  {
                    required: true,
                    type: "email",
                    max: 200,
                    message: "Informe um e-mail válido.",
                  },
                ]
          }
        >
          <Input disabled={editing} maxLength={200} autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="doc"
          label="Documento (CPF / CNPJ)"
          rules={[{ max: 20, message: "Use até 20 caracteres." }]}
        >
          <Input maxLength={20} placeholder="Opcional" />
        </Form.Item>
        <Form.Item
          name="role"
          label="Tipo de acesso"
          rules={[{ required: true }]}
        >
          <Select options={inviteRoleOptions} />
        </Form.Item>
        {user && (
          <Form.Item label="Status">
            <Input disabled value={statuses[user.status].text} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
