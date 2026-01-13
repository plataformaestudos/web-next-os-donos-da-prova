"use client";

import * as Styled from "./page.style";
import { Button, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function SignupSuccessPage() {
  const router = useRouter();

  return (
    <Styled.Container>
      <Styled.Card>
        <Styled.IconContainer>
          <CheckCircleOutlined style={{ fontSize: 80, color: "#52c41a" }} />
        </Styled.IconContainer>
        
        <Title level={2} style={{ textAlign: "center", marginTop: 24 }}>
          Parabéns! Cadastro realizado com sucesso
        </Title>
        
        <Styled.MessageContainer>
          <Paragraph style={{ textAlign: "center", fontSize: 16, marginBottom: 8 }}>
            Seja bem-vindo!
          </Paragraph>
          <Paragraph style={{ textAlign: "center", fontSize: 16 }}>
            Estamos muito felizes de ter você conosco.
          </Paragraph>
        </Styled.MessageContainer>

        <Styled.ButtonContainer>
          <Button
            type="primary"
            size="large"
            block
            onClick={() => router.push("/login")}
          >
            Ir para o login
          </Button>
        </Styled.ButtonContainer>
      </Styled.Card>
    </Styled.Container>
  );
}

