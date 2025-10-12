"use client";

import * as Styled from "./page.style";

import { App, Button, Form, Input, Typography } from "antd";
import { loginClient } from "./login.action";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/app/context/user.context";

const { Title } = Typography;

export default function LoginPage() {
  const { loginUser  } = useUser();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (
    values: { email: string; password: string }
  ) => {
    setLoading(true);

    try {
      const userData = await loginClient(values.email, values.password);
      if (!userData) throw new Error("Usuário não encontrado");
      await loginUser(userData);
      message.success("Login bem-sucedido!");
      router.push("/home");
    } catch (error) {
      console.log(error);
      message.error("Erro ao tentar realizar a ação.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("unauthorized") === "true") {
    message.error("Você foi deslogado, tente fazer login novamente");
    // NÃO chame supabase.auth.signOut() aqui
  }
}, [message]);


  return (
    <Styled.Container>
      <Styled.Card>
        <Title level={2}>Login</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label={<span>Email</span>}
            name="email"
            rules={[
              { required: true, message: "Por favor, insira seu email!" },
              { type: "email", message: "Email inválido!" },
            ]}
          >
            <Input
              type="email"
              placeholder="Digite seu email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span>Senha</span>}
            name="password"
            rules={[
              { required: true, message: "Por favor, insira sua senha!" },
            ]}
          >
            <Input.Password
              placeholder="Digite sua senha"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              loading={loading}
              htmlType="submit">
              Entrar
            </Button>
          </Form.Item>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <div>
              <span>Não tem uma conta? </span>
              <Button
                type="link"
                onClick={() => router.push("/signup")}
                style={{ padding: 0 }}
              >
                Cadastre-se
              </Button>
            </div>
            <div>
              <Button
                type="link"
                onClick={() => router.push("/forgot-password")}
                style={{ padding: 0 }}
              >
                Esqueci minha senha
              </Button>
            </div>
          </div>
        </Form>
      </Styled.Card>
    </Styled.Container>
  );
}
