import { Checkbox, Form, FormInstance, Input } from "antd";

import { MaskedInput } from "@/ui/masked-input/masked-input.component";
import { PaymentSection } from "./payment-info.style";

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
    <PaymentSection aria-label="Dados do cartão de crédito">
      <h3 className="payment-section-title">Dados do cartão de crédito</h3>
      <Form<PaymentInfo>
        form={formV}
        name="payment=info"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label="Nome no cartão"
          name="holderName"
          rules={[{ required: true, message: "Por favor preencha o nome" }]}
        >
          <Input placeholder="Como impresso no cartão" autoComplete="cc-name" />
        </Form.Item>

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
          <MaskedInput
            mask="____-____-____-____"
            replacement={{ _: /\d/ }}
            placeholder="0000-0000-0000-0000"
            inputMode="numeric"
            autoComplete="cc-number"
          />
        </Form.Item>

        <div className="payment-card-row">
          <Form.Item
            style={{ flex: 1 }}
            label="Validade"
            name="expiryDate"
            rules={[
              { required: true, message: "Por favor preencha a validade" },
            ]}
          >
            <MaskedInput
              placeholder="mm/aa"
              mask="__/__"
              replacement={{ _: /\d/ }}
              inputMode="numeric"
              autoComplete="cc-exp"
            />
          </Form.Item>

          <Form.Item
            style={{ flex: 1 }}
            label="CVV"
            name="cvv"
            extra={<span className="payment-card-help">Código de 3 dígitos no verso do cartão.</span>}
            rules={[
              {
                required: true,
                message: "Por favor preencha o código de segurança",
              },
            ]}
          >
            <MaskedInput
              mask="___"
              replacement={{ _: /\d/ }}
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </Form.Item>
        </div>

        <Form.Item name="saveCard" valuePropName="checked" label={null} className="payment-save-card">
          <Checkbox>Salvar cartão para compras futuras</Checkbox>
        </Form.Item>
      </Form>
    </PaymentSection>
  );
}
