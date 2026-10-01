"use client";

import { Button, Col, Collapse, Form, Input, Row, Select, Space } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import type { StaffUsersFilters } from "./staff-users.api";
import { roleOptions, statusOptions } from "./staff-users.constants";

export function StaffUsersFilterForm({
  filters,
  onApply,
}: {
  filters: StaffUsersFilters;
  onApply: (filters: StaffUsersFilters) => void;
}) {
  const [form] = Form.useForm<StaffUsersFilters>();
  const count = Object.values(filters).filter(Boolean).length;
  return (
    <Collapse
      ghost
      items={[
        {
          key: "filters",
          label: (
            <Space>
              <FilterOutlined />
              {count ? `Filtros (${count} ativos)` : "Filtros"}
            </Space>
          ),
          children: (
            <Form form={form} layout="vertical" onFinish={onApply}>
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item name="name" label="Nome">
                    <Input
                      allowClear
                      maxLength={100}
                      placeholder="Buscar por nome"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item name="email" label="E-mail">
                    <Input
                      allowClear
                      maxLength={200}
                      placeholder="Buscar por e-mail"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item name="doc" label="Documento">
                    <Input allowClear maxLength={20} placeholder="CPF / CNPJ" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item name="role" label="Tipo de acesso">
                    <Select
                      allowClear
                      placeholder="Todos os tipos"
                      options={roleOptions}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item name="status" label="Status">
                    <Select
                      allowClear
                      placeholder="Todos os status"
                      options={statusOptions}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Space wrap>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  Filtrar
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    onApply({});
                  }}
                >
                  Limpar filtros
                </Button>
              </Space>
            </Form>
          ),
        },
      ]}
    />
  );
}
