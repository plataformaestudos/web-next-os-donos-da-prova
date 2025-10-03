import { Col, Flex, Form, FormInstance, Input, Row } from "antd";

import { MaskedInput } from "@/ui/masked-input/masked-input.component";
import { PasswordField } from "./password-fields";
import { useEffect, useState } from "react";

export interface PersonalInfo {
    name: string;
    cpf: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    postalCode?: string;
    address?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    addressCountry?: string;
    addressNumber?: string;
    addressComplement?: string;
}

async function fetchAddressByCep(cep: string) {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) {
      throw new Error("CEP inválido");
    }
    const resp = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
    if (!resp.ok) {
      throw new Error("Falha na requisição CEP");
    }
    const data = await resp.json();
    if (data.erro) {
      throw new Error("CEP não encontrado");
    }
    console.log(data)
    return data; 
  }

export function PersonalInfoSecondStep({
    form,
}: {
    form: FormInstance<PersonalInfo>;
}) {
    const cepValue = Form.useWatch("postalCode", form);
    const [addressDisabled, setAddressDisabled] = useState(false);
    useEffect(() => {
        if (!cepValue) return;
    
        const cleaned = cepValue.replace(/\D/g, "");
        if (cleaned.length === 8) {
          fetchAddressByCep(cleaned)
            .then((data) => {
              form.setFieldsValue({
                address: data.logradouro,
                addressNeighborhood: data.bairro,
                addressCity: data.localidade,
                addressState: data.uf,
                addressCountry: "Brasil",
              });
              setAddressDisabled(true);
            })
            .catch((err) => {
              console.error("Erro ao buscar CEP:", err);
              form.setFieldsValue({
                address: "",
                addressNeighborhood: "",
                addressCity: "",
                addressState: "",
                addressCountry: "",
              });
              setAddressDisabled(false);
            });
        }else{
            setAddressDisabled(false);
        }
      }, [cepValue, form]);
    return (
        <>
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
                        style={{ flex: 0.5 }}
                        label="CPF"
                        name="cpf"
                        rules={[{ required: true, message: "Por favor preencha seu cpf" }]}
                    >
                        <MaskedInput mask="___.___.___-__" replacement={{ _: /\d/ }} />
                    </Form.Item>

                    <Form.Item
                        style={{ flex: 0.5 }}
                        label="Telefone"
                        name="phone"
                        rules={[{ required: true, message: "Por favor preencha seu telefone" }]}
                    >
                        <MaskedInput mask="(__) _____-____" replacement={{ _: /\d/ }} />
                    </Form.Item>

                    <Form.Item
                        style={{ flex: 1 }}
                        label="E-mail"
                        name="email"
                        rules={[{ required: true, message: "Por favor preencha o e-mail" }]}
                    >
                        <Input />
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
                        style={{ flex: 0.4 }}
                        label="Rua"
                        name="address"
                        rules={[{ required: true, message: "Por favor preencha seu endereço" }]}

                    >
                        <Input disabled={addressDisabled}/>
                    </Form.Item>

                    <Form.Item
                        style={{ flex: 0.15 }}
                        label="Número"
                        name="addressNumber"
                        rules={[{ required: true, message: "Por favor preencha o número" }]}
                    >
                        <Input />
                    </Form.Item>

                    
                    <Form.Item
                        style={{ flex: 0.25 }}
                        label="Complemento"
                        name="addressComplement"
                    >
                        <Input />
                    </Form.Item>

                </Flex>

                <Flex gap={12}>
                <Form.Item
                        style={{ flex: 0.35 }}
                        label="Bairro"
                        name="addressNeighborhood"
                    >
                        <Input disabled={addressDisabled}/>
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 0.35 }}
                        label="Cidade"
                        name="addressCity"
                    >
                        <Input disabled={addressDisabled} />
                    </Form.Item>

                    <Form.Item
                        style={{ flex: 0.15 }}
                        label="Estado"
                        name="addressState"
                    >
                        <Input disabled={addressDisabled}/>
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 0.25}}
                        label="País"
                        name="addressCountry"
                    >
                        <Input disabled={addressDisabled}/>
                    </Form.Item>
                </Flex>

                <Row gutter={16}>

                    <Col span={24} md={12}>
                        <PasswordField form={form} />
                    </Col>

                    <Col span={24} md={12}>
                        <Form.Item
                            label="Confirmar a senha"
                            name="confirmPassword"
                            dependencies={["password"]} // depende do valor do campo senha
                            rules={[
                                { required: true, message: "Por favor preencha a confirmação da senha" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("As senhas não coincidem"));
                                    },
                                }),
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
