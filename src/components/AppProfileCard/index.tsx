"use client";

import { UserExtended } from "@/app/context/user.context";
import { Button, Card, Descriptions, Tabs, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

interface AppProfileCardProps {
  user: UserExtended | null;
}

const { Title } = Typography;
const { TabPane } = Tabs;

const ProfileCard = styled(Card)`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1000px;
`;

const ProfileTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ProfileTitle = styled(Title)`
  color: #1890ff;
  text-align: center;
`;

const AvatarWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const ButtonContent = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const formatDate = (date: string | undefined) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR");
};

const formatDocument = (document: string | undefined) => {
  if (!document) return "";
  if (document.length === 11) {
    return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else {
    return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
};

const formatCep = (cep: string | undefined) => {
  if (!cep) return "";
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
};

export const AppProfileCard = ({ user }: AppProfileCardProps) => {
  console.log("AppProfileCard render", { user });
  return (
    <ProfileCard title="">
      <ProfileTitleWrapper>
        <ProfileTitle level={2}>Perfil do Usuário</ProfileTitle>
        <Link href="/profile/edit">
          <Button
            type="primary"
            size="large"
          >
            Editar Perfil
          </Button>
        </Link>
      </ProfileTitleWrapper>
      <AvatarWrapper>
        <Image
          src="/images/usuario-passaro.png"
          alt="Usuário pássaro"
          width={170}
          height={170}
          style={{ height: "auto" }}
        />
      </AvatarWrapper>

      <ProfileTitle level={2}>{user?.profile?.name}</ProfileTitle>

      <Tabs defaultActiveKey="1">
        <TabPane
          tab="Meu Perfil"
          key="1"
        >
          <Descriptions
            bordered
            column={1}
          >
            <Descriptions.Item label="Apelido">{user?.profile?.name}</Descriptions.Item>
            <Descriptions.Item label="Usuário desde">
              {formatDate(user?.user?.created_at)}
            </Descriptions.Item>
          </Descriptions>
          <ButtonContent>
            <Link href="/subscription">
              <Button
                type="primary"
                size="large"
              >
                Gerenciar Assinatura
              </Button>
            </Link>
          </ButtonContent>
        </TabPane>

        <TabPane
          tab="Dados Cadastrais"
          key="2"
        >
          <Descriptions
            bordered
            column={1}
          >
            <Descriptions.Item label="Nome Completo">
              {user?.profile?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{user?.user?.email ? user?.user?.email : ""}</Descriptions.Item>
            <Descriptions.Item label="CPF">{formatDocument(user?.profile?.doc ? user?.profile?.doc : "")}</Descriptions.Item>
            {/* <Descriptions.Item label="Senha">{user?.email}</Descriptions.Item> */}
            <Descriptions.Item label="CEP">{formatCep(user?.user_metadata?.postalCode ? user?.user_metadata?.postalCode : "")}</Descriptions.Item>
            <Descriptions.Item label="CEP">{31810440}</Descriptions.Item>
          </Descriptions>
          <ButtonContent>
            <Link href="/subscription">
              <Button
                type="primary"
                size="large"
              >
                Gerenciar Assinatura
              </Button>
            </Link>
          </ButtonContent>
        </TabPane>

      </Tabs>
    </ProfileCard>
  );
};
