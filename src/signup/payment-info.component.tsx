import { Checkbox, Flex, Form, FormInstance, Input, Typography } from "antd";

import { MaskedInput } from "@/ui/masked-input/masked-input.component";

export interface PaymentInfo {
  holderName: string;
  number: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

export function PaymentInfoThirdStep({
  formV,
}: {
  formV: FormInstance<PaymentInfo>;
}) {
  return (
    <>
      <Typography.Paragraph>
        Preencha as informações de pagamento
      </Typography.Paragraph>
      <Form<PaymentInfo>
        form={formV}
        name="payment=info"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          style={{ flex: 1 }}
          label="Número do cartão"
          name="number"
          rules={[
            {
              required: true,
              message: "Por favor preencha o número do cartão",
            },
          ]}
        >
          <MaskedInput mask="____-____-____-____" replacement={{ _: /\d/ }} />
        </Form.Item>

        <Flex gap={12}>
          <Form.Item
            style={{ flex: 1 }}
            label="Validade"
            name="expiryDate"
            rules={[
              { required: true, message: "Por favor preencha a validade" },
            ]}
          >
            <MaskedInput
              placeholder="mm/yy"
              mask="__/__"
              replacement={{ _: /\d/ }}
            />
          </Form.Item>

          <Form.Item
            style={{ flex: 1 }}
            label="CVV"
            name="cvv"
            rules={[
              {
                required: true,
                message: "Por favor preencha o código de segurança",
              },
            ]}
          >
            <MaskedInput mask="___" replacement={{ _: /\d/ }} />
          </Form.Item>
        </Flex>

        <Form.Item
          label="Nome no cartão"
          name="holderName"
          rules={[{ required: true, message: "Por favor preencha o nome" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="saveCard" valuePropName="checked" label={null}>
          <Checkbox>Salvar cartão para compras futuras</Checkbox>
        </Form.Item>
      </Form>
    </>
  );
}
