"use client";

import { Button, Form, Input, Typography, message } from "antd";
import { login, signup } from "./actions";

import { useRouter } from "next/navigation";
import { useState } from "react";

const { Title } = Typography;

export default function LoginPage() {
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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex w-full max-w-4xl">
        <div className="w-1/2 h-full relative">
          <img
            src="/images/os-donos-logo.jpeg"
            alt="Logo"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-1/2 p-8 bg-white rounded-lg shadow-md">
          <Title level={2} className="text-center mb-4 text-3xl">
            Login
          </Title>
          <Form form={form} layout="vertical">
            <Form.Item
              label={<span className="text-base">Email</span>}
              name="email"
              rules={[
                { required: true, message: "Por favor, insira seu email!" },
                { type: "email", message: "Email inválido!" },
              ]}
            >
              <Input type="email" placeholder="Digite seu email" size="large" />
            </Form.Item>

            <Form.Item
              label={<span className="text-base">Senha</span>}
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

            <div className="text-center">
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
        </div>
      </div>
    </div>
  );
}
