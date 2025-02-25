"use client";

import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Tabs,
  Typography,
} from "antd";

import Link from "next/link";
import { UserOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useState } from "react";

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

const UserProfile = () => {
  const [user] = useState({
    name: "Thiago Nogueira",
    email: "thiagohenriquean@gmail.com",
    plan: "Premium",
    paymentMethod: "Cartão de Crédito",
    avatarUrl: "/images/default-avatar.jpg",
    createdBy: "01/01/2025",
    expirationDate: "01/01/2026",
    CPF: "151.185.836-24",
    password: "********",
    CEP: "31810-370",
    surname: "Thiago",
  });

  return (
    <Row justify="center" style={{ width: "100%" }}>
      <Col xs={24} sm={16} md={12} lg={10}>
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
            <Avatar size={100} icon={<UserOutlined />} src={user.avatarUrl} />
          </AvatarWrapper>

          <ProfileTitle level={2}>{user.name}</ProfileTitle>

          <Tabs defaultActiveKey="1">
            <TabPane tab="Meu Perfil" key="1">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Apelido">
                  {user.surname}
                </Descriptions.Item>
                <Descriptions.Item label="Usuário desde">
                  {user.createdBy}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Dados Cadastrais" key="2">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Nome Completo">
                  {user.name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {user.email}
                </Descriptions.Item>
                <Descriptions.Item label="CPF">{user.CPF}</Descriptions.Item>
                <Descriptions.Item label="Senha">
                  {user.password}
                </Descriptions.Item>
                <Descriptions.Item label="CEP">{user.CEP}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Assinatura" key="3">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Plano">{user.plan}</Descriptions.Item>
                <Descriptions.Item label="Forma de Pagamento">
                  {user.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Data de Vencimento">
                  {user.expirationDate}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          </Tabs>
        </ProfileCard>
      </Col>
    </Row>
  );
};

export default UserProfile;
