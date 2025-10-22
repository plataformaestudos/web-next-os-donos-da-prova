"use client";

import { UserExtended } from "@/app/context/user.context";
import { Button, Card, Descriptions, Tabs, Typography, App } from "antd";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { useState, useTransition } from "react";
import { DeleteAccountModal } from "@/profile/delete-account/delete-account-modal.component";
import { deleteAccountClient } from "@/profile/delete-account/delete-account.action";
import { useRouter } from "next/navigation";

interface AppProfileCardProps {
  user: UserExtended | null;
}

const { Title } = Typography;

const ProfileCard = styled(Card)`
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 95%;
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
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isPending, startTransition] = useTransition();
    const app = App.useApp?.();
    const message = app?.message;
    const router = useRouter();

    const handleDeleteAccount = () => {
        setIsDeleteModalVisible(true);
    };

    const handleConfirmDelete = (reason?: string) => {
        startTransition(async () => {
            try {
                const res = await deleteAccountClient({ deletionReason: reason });
                if (res.success) {
                    message?.success("Conta excluída com sucesso!");
                    router.push("/login")
                } else {
                    message?.error(res.error ?? "Erro ao excluir conta");
                }
            } catch (err: unknown) {
                const text = err instanceof Error ? err.message : "Erro inesperado ao excluir conta";
                message?.error(text);
            } finally {
                setIsDeleteModalVisible(false);
            }
        });
    };

    const handleCancelDelete = () => {
        setIsDeleteModalVisible(false);
    };

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
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <Link href="/subscription">
                <Button type="primary" size="large">
                  Gerenciar Assinatura
                </Button>
              </Link>
              <Button 
                type="default" 
                size="large" 
                danger
                onClick={handleDeleteAccount}
                disabled={isPending}
              >
                Excluir Conta
              </Button>
            </div>
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
            <Descriptions.Item label="Cidade">
              {user?.profile?.address_city ?? user?.user_metadata?.addressCity}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              {user?.profile?.address_state ?? user?.user_metadata?.addressState}
            </Descriptions.Item>
            <Descriptions.Item label="País">
              {user?.profile?.address_country ?? user?.user_metadata?.addressCountry}
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
      
      <DeleteAccountModal
        visible={isDeleteModalVisible}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={isPending}
      />
    </ProfileCard>
  );
};
