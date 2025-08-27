"use client";

import { Avatar, Button, Card, Descriptions, Tabs, Typography } from "antd";
import Link from "next/link";
import { UserOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { User } from "@supabase/supabase-js";

interface AppProfileCardProps {
  user: User | null;
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

export const AppProfileCard = ({ user }: AppProfileCardProps) => {
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
        <Avatar
          size={100}
          icon={<UserOutlined />}
        />
      </AvatarWrapper>

      <ProfileTitle level={2}>{user?.email}</ProfileTitle>

      <Tabs defaultActiveKey="1">
        <TabPane
          tab="Meu Perfil"
          key="1"
        >
          <Descriptions
            bordered
            column={1}
          >
            <Descriptions.Item label="Apelido">{user?.email}</Descriptions.Item>
            <Descriptions.Item label="Usuário desde">
              {user?.created_at}
            </Descriptions.Item>
          </Descriptions>
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
              {user?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
            <Descriptions.Item label="CPF">{user?.email}</Descriptions.Item>
            <Descriptions.Item label="Senha">{user?.email}</Descriptions.Item>
            <Descriptions.Item label="CEP">{user?.email}</Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane
          tab="Assinatura"
          key="3"
        >
          <Descriptions
            bordered
            column={1}
          >
            <Descriptions.Item label="Plano">{user?.email}</Descriptions.Item>
            <Descriptions.Item label="Forma de Pagamento">
              {user?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Data de Vencimento">
              {user?.email}
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
      </Tabs>
    </ProfileCard>
  );
};
