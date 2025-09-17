"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/user.context";
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    Row,
    Typography,
    Tabs,
    message,
} from "antd";
import Image from "next/image";
import styled from "styled-components";
import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";

const { Title } = Typography;

const ProfileCard = styled(Card)`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1000px;
  margin: 20px auto;
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
  gap: 10px;
`;

type UserProfileAPI = {
  id: string;
  roleId: string;
  doc: string;
  name: string;
  nickname: string;
  createdAt: string; // ISO date string
  createdBy: string;
  updatedAt: string; // ISO date string
  updatedBy: string;
  userId: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  address: string;
  addressNeighborhood: string;
  addressNumber: string;
  addressComplement: string;
  avatarUrl: string | null;
  phone: string;
}


type EditProfileFormValues = {
  nickname?: string;
  name?: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNeighborhood?: string;
  addressNumber?: string;
  addressComplement?: string;
};

const formatDate = (date: string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR");
};

export default function EditProfilePage() {
    const [form] = Form.useForm();
    const router = useRouter();
    const { user, loading , refreshProfile} = useUser();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.profile?.name ?? user.user_metadata?.name ?? "",
                email: user.profile?.email ?? user.user_metadata?.email ?? user.user?.email ?? "",
                cpfCnpj: user.profile?.doc ?? user.user_metadata?.cpfCnpj ?? "",
                postalCode: user.profile?.postal_code ?? user.user_metadata?.postalCode ?? "",
                address: user.profile?.address ?? user.user_metadata?.address ?? "",
                addressNeighborhood: user.profile?.address_neighborhood ?? user.user_metadata?.addressNeighborhood ?? "",
                addressNumber: user.profile?.address_number ?? user.user_metadata?.addressNumber ?? "",
                addressComplement: user.profile?.address_complement ?? user.user_metadata?.addressComplement ?? "",
                nickname: user.profile?.nickname ?? "",
                phone: user.profile?.phone ?? user.user_metadata?.phone ?? "",
            });
        } else {
            form.resetFields();
        }
    }, [user, form]);

    if (loading) {
        return (
            <Row justify="center" style={{ marginTop: "50px" }}>
                <p>Carregando...</p>
            </Row>
        );
    }

    if (!user) {
        return (
            <Row justify="center" style={{ marginTop: "50px" }}>
                <p>Nenhum usuário encontrado</p>
            </Row>
        );
    }

    const handleSave = async (values: EditProfileFormValues) => {
        message.loading({ content: "Salvando...", key: "save" });
        const payload = values;
        return HttpClient.fetch<ResponseModel<UserProfileAPI>>('/profiles', {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (response.data) {
                    message.success({ content: "Perfil atualizado com sucesso!", key: "save" });
                    refreshProfile();
                    return response.data;
                } else {
                    message.error({ content: response.message ?? "Erro ao salvar perfil", key: "save" });
                    return null;
                }
            })
            .catch((err) => {
                console.error("Erro ao salvar perfil:", err);
                message.error({ content: "Erro ao salvar perfil", key: "save" });
                return null;
            });

    };

    const handleCancel = () => {
        form.resetFields();
        router.back();
    };

    const tabsItems = [
        {
            key: "1",
            label: "Meu Perfil",
            children: (
                <>
                    <Form.Item
                        label="Apelido"
                        name="nickname"
                        rules={[{ required: true, message: "Por favor, insira seu apelido" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Usuário desde">
                        <Input value={formatDate(user.profile?.created_at)} disabled />
                    </Form.Item>
                </>
            ),
        },
        {
            key: "2",
            label: "Dados Cadastrais",
            children: (
                <>
                    <Form.Item
                        label="Nome Completo"
                        name="name"
                        rules={[{ required: true, message: "Por favor, insira o nome completo" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Por favor, insira o email" },
                            { type: "email", message: "Email inválido" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Telefone"
                        name="phone"
                        rules={[{ required: false, message: "Por favor, insira o telefone" }]}
                    >
                        <Input />
                    </Form.Item>


                    <Form.Item label="CPF / CNPJ" name="cpfCnpj">
                        <Input />
                    </Form.Item>
                </>
            ),
        },
        {
            key: "3",
            label: "Endereço",
            children: (
                <>
                    <Form.Item label="CEP" name="postalCode">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Endereço" name="address">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Bairro" name="addressNeighborhood">
                        <Input />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={16}>
                            <Form.Item label="Número" name="addressNumber">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Complemento" name="addressComplement">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
    ];

    return (
        <Row justify="center" style={{ width: "100%" }}>
            <Col xs={24} sm={20} md={16} lg={12}>
                <ProfileCard title="">
                    <ProfileTitleWrapper>
                        <ProfileTitle level={2}>Editar Perfil</ProfileTitle>
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

                    <Form form={form} layout="vertical" onFinish={handleSave}>
                        <Tabs defaultActiveKey="1" items={tabsItems} />

                        <ButtonContent>
                            <Button type="primary" htmlType="submit" size="large">
                                Salvar
                            </Button>
                            <Button size="large" onClick={handleCancel}>
                                Cancelar
                            </Button>
                        </ButtonContent>
                    </Form>
                </ProfileCard>
            </Col>
        </Row>
    );
}
