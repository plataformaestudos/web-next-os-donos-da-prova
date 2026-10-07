"use client";

import * as Styled from "./page.style";
import { Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CheckoutBrand from "@/signup/checkout-brand.component";
import { StageHeading } from "@/signup/signup.style";

export default function SignupSuccessPage() {
  const router = useRouter();

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
          <p>Entre na sua conta para continuar seus estudos.</p>
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
