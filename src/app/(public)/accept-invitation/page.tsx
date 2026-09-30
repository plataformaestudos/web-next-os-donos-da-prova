"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Form, Input, Spin, Typography } from "antd";
import Link from "next/link";
import { createClient } from "@/util/supabase/client";
import {
  acceptStaffInvitation,
  staffErrorMessage,
} from "@/staff-users/staff-users.api";

export default function AcceptInvitationPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const preparation = useRef<Promise<{ token: string; email: string }> | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    // React Strict Mode can run this effect twice. A link must only be verified once.
    preparation.current ??= (async () => {
      try {
        const url = new URL(window.location.href);
        const hash = new URLSearchParams(url.hash.slice(1));
        const linkError =
          hash.get("error_description") ||
          url.searchParams.get("error_description");
        if (linkError)
          throw new Error(
            "Este link é inválido ou expirou. Solicite o reenvio ao administrador.",
          );
        const token = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const tokenHash = url.searchParams.get("token_hash");
        const code = url.searchParams.get("code");
        const initialSession = await supabase.auth.getSession();
        if (token && refreshToken) {
          const result = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refreshToken,
          });
          if (result.error) throw result.error;
        } else if (tokenHash) {
          const type = url.searchParams.get("type");
          if (type !== "invite" && type !== "recovery")
            throw new Error("Tipo de link inválido.");
          const result = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (result.error) throw result.error;
        } else if (code && !initialSession.data.session) {
          const result = await supabase.auth.exchangeCodeForSession(code);
          if (result.error) throw result.error;
        }
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user?.user_metadata?.staff_invitation_id)
          throw new Error(
            "Este link é inválido ou expirou. Solicite o reenvio ao administrador.",
          );
        const session = await supabase.auth.getSession();
        if (!session.data.session)
          throw new Error("Não foi possível validar o convite.");
        return {
          token: session.data.session.access_token,
          email: data.user.email || "",
        };
      } finally {
        // Remove tokens from the address bar and browser history.
        window.history.replaceState(null, "", "/accept-invitation");
      }
    })();
    void preparation.current
      .then(({ token, email }) => {
        if (mounted) {
          setAccessToken(token);
          setEmail(email);
        }
      })
      .catch(() => {
        if (mounted)
          setError(
            "Este link é inválido ou expirou. Solicite o reenvio ao administrador.",
          );
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const submit = async ({ password }: { password: string }) => {
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    try {
      // Refresh the token if the visitor spent a long time filling the form.
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      await acceptStaffInvitation(
        data.session?.access_token || accessToken,
        password,
      );
      setComplete(true);
      setAccessToken(null);
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      setError(staffErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{ width: "100%", maxWidth: 480 }}>
      <Typography.Title level={2}>
        {complete ? "Acesso criado" : "Definir senha de acesso"}
      </Typography.Title>
      {checking ? (
        <Spin tip="Validando convite">
          <div style={{ minHeight: 100 }} />
        </Spin>
      ) : complete ? (
        <>
          <Alert
            type="success"
            showIcon
            message="Senha definida com sucesso!"
            description="Entre com seu e-mail e sua nova senha para acessar a plataforma."
          />
          <Link href="/login">
            <Button type="primary" block style={{ marginTop: 24 }}>
              Ir para o login
            </Button>
          </Link>
        </>
      ) : (
        <>
          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              style={{ marginBottom: 20 }}
            />
          )}
          {accessToken ? (
            <>
              <Typography.Paragraph>
                Você foi convidado para a plataforma. Defina sua senha para o
                e-mail <strong>{email}</strong>.
              </Typography.Paragraph>
              <Form layout="vertical" onFinish={submit}>
                <Form.Item
                  name="password"
                  label="Nova senha"
                  rules={[
                    {
                      required: true,
                      min: 8,
                      max: 128,
                      message: "Use entre 8 e 128 caracteres.",
                    },
                    {
                      pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/,
                      message:
                        "Inclua letra maiúscula, número e caractere especial.",
                    },
                  ]}
                >
                  <Input.Password autoComplete="new-password" maxLength={128} />
                </Form.Item>
                <Form.Item
                  name="confirmation"
                  label="Confirmar senha"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Confirme sua senha." },
                    ({ getFieldValue }) => ({
                      validator: (_, value) =>
                        value === getFieldValue("password")
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("As senhas não coincidem."),
                            ),
                    }),
                  ]}
                >
                  <Input.Password autoComplete="new-password" maxLength={128} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={saving} block>
                  Definir senha
                </Button>
              </Form>
            </>
          ) : (
            <Link href="/login">Voltar para o login</Link>
          )}
        </>
      )}
    </Card>
  );
}
