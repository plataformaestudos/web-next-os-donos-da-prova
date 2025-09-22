import { Col, Flex, Form, FormInstance, Input, Row } from "antd";

import { MaskedInput } from "@/ui/masked-input/masked-input.component";
import { PasswordField } from "./password-fields";

export interface PersonalInfo {
    name: string;
    cpf: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
}

export function PersonalInfoSecondStep({
    form,
}: {
    form: FormInstance<PersonalInfo>;
}) {
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
