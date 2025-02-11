"use client";

import * as Styled from "./page.style";

import { App, Button, Form, Input, Typography } from "antd";
import { login, signup } from "./actions";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Title } = Typography;

export default function LoginPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (
    values: { email: string; password: string },
    action: "login" | "signup"
  ) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    try {
      if (action === "login") {
        await login(formData);
        message.success("Login bem-sucedido!");
        router.push("/home");
      } else {
        await signup(formData);
        message.success("Cadastro bem-sucedido!");
        router.push("/home");
      }
    } catch (error) {
      console.log(error);
      message.error("Erro ao tentar realizar a ação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Styled.Container>
      <Styled.Card>
        <Styled.LogoContainer>
          <Image
            width={448}
            height={448}
            src="/images/os-donos-logo.jpeg"
            alt="Logo"
          />
        </Styled.LogoContainer>
        <Styled.FormContainer>
          <Title level={2}>Login</Title>
          <Form form={form} layout="vertical">
            <Form.Item
              label={<span>Email</span>}
              name="email"
              rules={[
                { required: true, message: "Por favor, insira seu email!" },
                { type: "email", message: "Email inválido!" },
              ]}
            >
              <Input type="email" placeholder="Digite seu email" size="large" />
            </Form.Item>

            <Form.Item
              label={<span>Senha</span>}
              name="password"
              rules={[
                { required: true, message: "Por favor, insira sua senha!" },
              ]}
            >
              <Input.Password placeholder="Digite sua senha" size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                block
                loading={loading}
                onClick={() => onFinish(form.getFieldsValue(), "login")}
              >
                Entrar
              </Button>
            </Form.Item>

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
          </Form>
        </Styled.FormContainer>
      </Styled.Card>
    </Styled.Container>
  );
}
