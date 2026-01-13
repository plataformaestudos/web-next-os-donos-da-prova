"use client";

import * as Styled from "./page.style";

import { App, Button, Form, Input, Typography, Alert } from "antd";
import { forgotPasswordClient } from "@/auth/forgot-password/forgot-password.action";
import { executeRecaptcha } from "@/hooks/useRecaptcha";

import { useRouter } from "next/navigation";
import { useState } from "react";

const { Title } = Typography;

export default function ForgotPasswordPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);

    try {
      // Executar reCAPTCHA v3
      const recaptchaToken = await executeRecaptcha("forgot_password");

      const res = await forgotPasswordClient({ 
        email: values.email,
        recaptchaToken: recaptchaToken
      });
      
      if (res.success) {
        setEmailSent(true);
        message.success("Email de recuperação enviado com sucesso!");
      } else {
        message.error(res.error ?? "Erro ao enviar email de recuperação");
      }
    } catch (error) {
      console.log(error);
      message.error("Erro ao tentar enviar email de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    // Se houver histórico de navegação, volta para página anterior
    // Caso contrário, redireciona para login
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/login");
    }
  };

  if (emailSent) {
    return (
      <Styled.Container>
        <Styled.Card>
          <Title level={2}>Email Enviado</Title>
          <Alert
            message="Email de recuperação enviado!"
            description="Enviamos um link para redefinir sua senha para o email cadastrado. Verifique sua caixa de entrada e siga as instruções."
            type="success"
            showIcon
            style={{ marginBottom: 24}}
          />
          <Button
            type="primary"
            block
            onClick={handleGoBack}
            size="large"
          >
            Voltar
          </Button>
        </Styled.Card>
      </Styled.Container>
    );
  }

  return (
    <Styled.Container>
      <Styled.Card>
        <Title level={2}>Recuperar Senha</Title>
        <p style={{ textAlign: "center", marginBottom: 24, color: "#666" }}>
          Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
        </p>
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
            style={{ width: 300 }}
          >
            <Input
              type="email"
              placeholder="Digite seu email"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              loading={loading}
              htmlType="submit"
            >
              Enviar Link de Recuperação
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Button
              type="link"
              onClick={handleGoBack}
              style={{ padding: 0 }}
            >
              Voltar
            </Button>
          </div>
        </Form>
      </Styled.Card>
    </Styled.Container>
  );
}
