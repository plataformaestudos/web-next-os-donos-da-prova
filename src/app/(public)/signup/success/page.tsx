"use client";

import * as Styled from "./page.style";
import { Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CheckoutBrand from "@/signup/checkout-brand.component";
import { StageHeading } from "@/signup/signup.style";
import { useEffect, useState } from "react";
import { readSignupSuccessStatus, SignupSuccessStatus } from "@/signup/signup-success.state";

export default function SignupSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SignupSuccessStatus>("unknown");

  useEffect(() => { setStatus(readSignupSuccessStatus()); }, []);

  return (
    <Styled.Container>
      <CheckoutBrand />
      <Styled.Card>
        <Styled.IconContainer aria-hidden="true">
          <CheckCircleOutlined />
        </Styled.IconContainer>
        <StageHeading>Cadastro realizado com sucesso</StageHeading>
        <Styled.MessageContainer>
          <p>Seja bem-vindo aos Donos da Prova!</p>
          {status === "confirmation-required" ? (
            <>
              <p>Confirme seu e-mail antes de entrar na plataforma.</p>
              <p>Confira sua caixa de entrada e a pasta de spam e siga o link de confirmação recebido.</p>
            </>
          ) : status === "login" ? (
            <p>Entre na sua conta para continuar seus estudos.</p>
          ) : (
            <>
              <p>Entre na sua conta para continuar seus estudos.</p>
              <p>Caso seja necessário confirmar seu e-mail, confira sua caixa de entrada e a pasta de spam e siga o link recebido antes de entrar.</p>
            </>
          )}
        </Styled.MessageContainer>
        <Styled.ButtonContainer>
          <Button type="primary" size="large" block onClick={() => router.push("/login")}>
            Ir para o login
          </Button>
        </Styled.ButtonContainer>
      </Styled.Card>
    </Styled.Container>
  );
}
