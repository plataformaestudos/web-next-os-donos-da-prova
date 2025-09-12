import { Col, Flex, Form, FormInstance, Input, Row } from "antd";

import { MaskedInput } from "@/ui/masked-input/masked-input.component";

export interface PersonalInfo {
  name: string;
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function PersonalInfoSecondStep({
  form,
}: {
  form: FormInstance<PersonalInfo>;
}) {
  return (
    <>
      {/* <Typography.Paragraph>
        Preencha suas informações pessoais
      </Typography.Paragraph> */}
      <Form<PersonalInfo>
        form={form}
        name="personal-info"
        autoComplete="off"
        layout="vertical"
      >
        <Flex gap={12}>
          <Form.Item
            style={{ flex: 1 }}
            label="Nome"
            name="name"
            rules={[{ required: true, message: "Por favor preencha seu nome" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            style={{ flex: 1 }}
            label="CPF"
            name="cpf"
            rules={[{ required: true, message: "Por favor preencha seu cpf" }]}
          >
            <MaskedInput mask="___.___.___-__" replacement={{ _: /\d/ }} />
          </Form.Item>
        </Flex>

        <Flex gap={12}>
          <Form.Item
            style={{ flex: 0.2 }}
            label="CEP"
            name="postalCode"
            rules={[{ required: true, message: "Por favor preencha seu cep" }]}
          >
            <MaskedInput mask="_____-___" replacement={{ _: /\d/ }} />
          </Form.Item>

          <Form.Item
            style={{ flex: 0.3 }}
            label="Rua"
            name="address"
            rules={[{ required: true, message: "Por favor preencha seu endereço" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            style={{ flex: 0.1 }}
            label="Número"
            name="addressNumber"
            rules={[{ required: true, message: "Por favor preencha o número" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            style={{ flex: 0.3 }}
            label="Bairro"
            name="addressNeighborhood"
          >
            <Input />
          </Form.Item>
          <Form.Item
            style={{ flex: 0.2 }}
            label="Complemento"
            name="addressComplement"
          >
            <Input />
          </Form.Item>
        </Flex>

        <Form.Item
          label="E-mail"
          name="email"
          rules={[{ required: true, message: "Por favor preencha o e-mail" }]}
        >
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={24} md={12}>
            <Form.Item
              style={{ flex: 1 }}
              label="Senha"
              name="password"
              rules={[
                { required: true, message: "Por favor preencha a senha" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>

          <Col span={24} md={12}>
            <Form.Item
              style={{ flex: 1 }}
              label="Confirmar a senha"
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: "Por favor preencha a confirmação da senha",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
}
