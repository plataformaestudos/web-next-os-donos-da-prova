"use client";

import * as Styled from "./page.style";

import { App, Button, Form, Input, Typography, Alert } from "antd";
import { createClient } from "@/util/supabase/client";
import { registerPasswordResetEventClient } from "@/auth/reset-password/reset-password.action";
import { PasswordField } from "@/components/PasswordField";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const { Title } = Typography;

export default function ResetPasswordPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordReset, setPasswordReset] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.substring(1)); 
    
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    
    
    if (accessToken && refreshToken) {
      const supabase = createClient();
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ data, error }) => {
        if (error) {
          console.error("Erro ao configurar sessão:", error);
          message.error("Erro ao processar link de redefinição de senha");
        } else {
          console.log("Sessão configurada com sucesso:", data);
        }
      });
    }
  }, []);

  const onFinish = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error("As senhas não coincidem!");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: values.password
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const eventRes = await registerPasswordResetEventClient({
        eventType: "password_reset",
        metadata: {
          resetMethod: "email_link",
          timestamp: new Date().toISOString(),
        }
      });

      if (!eventRes.success) {
        console.warn("Erro ao registrar evento:", eventRes.error);
      }

      setPasswordReset(true);
      message.success("Senha alterada com sucesso!");

    } catch (error) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao alterar senha";
      message.error(errorMessage);
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

  if (passwordReset) {
    return (
      <Styled.Container>
        <Styled.Card>
          <Title level={2}>Senha Alterada</Title>
          <Alert
            message="Senha alterada com sucesso!"
            description="Sua senha foi alterada com sucesso. Você pode fazer login com sua nova senha."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Button
            type="primary"
            block
            onClick={handleGoBack}
            size="large"
          >
            Continuar
          </Button>
        </Styled.Card>
      </Styled.Container>
    );
  }

  return (
    <Styled.Container>
      <Styled.Card>
        <Title level={2}>Redefinir Senha</Title>
        <p style={{ textAlign: "center", marginBottom: 22 }}>
          Digite sua nova senha abaixo.
        </p>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <PasswordField
            form={form}
            fieldName="password"
            label="Nova Senha"
            placeholder="Digite sua nova senha"
            size="large"
            showValidationRules={true}
          />

          <Form.Item
            label={<span>Confirmar Nova Senha</span>}
            name="confirmPassword"
            rules={[
              { required: true, message: "Por favor, confirme sua nova senha!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('As senhas não coincidem!'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirme sua nova senha"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              loading={loading}
              htmlType="submit"
              style={{marginTop: 16}}
            >
              Alterar Senha
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
