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
    const items = [
    {
      key: "1",
      label: "Meu Perfil",
      children: (
        <>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Apelido">{user?.profile?.nickname}</Descriptions.Item>
            <Descriptions.Item label="Usuário desde">
              {formatDate(user?.profile?.created_at)}
            </Descriptions.Item>
          </Descriptions>
          <ButtonContent>
            <Link href="/subscription">
              <Button type="primary" size="large">
                Gerenciar Assinatura
              </Button>
            </Link>
          </ButtonContent>
        </>
      ),
    },
    {
      key: "2",
      label: "Dados Cadastrais",
      children: (
        <>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Nome Completo">{user?.profile?.name ?? user?.user_metadata?.name}</Descriptions.Item>
            <Descriptions.Item label="Email">
              {user?.profile?.email ?? user?.user_metadata?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Telefone">
              {user?.profile?.phone ?? user?.user_metadata?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="CPF">
              {formatDocument(user?.profile?.doc ?? user?.user_metadata?.cpfCnpj)}
            </Descriptions.Item>
          </Descriptions>
        </>
      ),
    },
    {
      key: "3",
      label: "Endereço",
      children: (
        <>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="CEP">
              {formatCep(user?.profile?.postal_code ?? user?.user_metadata?.postalCode)}
            </Descriptions.Item>
            <Descriptions.Item label="Endereço">
              {user?.profile?.address ?? user?.user_metadata?.address}
            </Descriptions.Item>
            <Descriptions.Item label="Bairro">
              {user?.profile?.address_neighborhood ?? user?.user_metadata?.addressNeighborhood}
            </Descriptions.Item>
            <Descriptions.Item label="Número">
              {user?.profile?.address_number ?? user?.user_metadata?.addressNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Complemento">
              {user?.profile?.address_complement ?? user?.user_metadata?.addressComplement}
            </Descriptions.Item>
          </Descriptions>
        </>
      ),
    },
  ];

  return (
    <ProfileCard title="">
      <ProfileTitleWrapper>
        <ProfileTitle level={2}>Perfil do Usuário</ProfileTitle>
        <Link href="/profile/edit">
          <Button type="primary" size="large">
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

      <Tabs defaultActiveKey="1" items={items} />
    </ProfileCard>
  );
};
