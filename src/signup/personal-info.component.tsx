import { Alert, Col, Flex, Form, FormInstance, Input, Row, Spin } from "antd";

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

async function fetchAddressByCep(cep: string, signal?: AbortSignal) {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) {
      throw new Error("CEP inválido");
    }
    const resp = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`, { signal });
    if (!resp.ok) {
      throw new Error("Falha na requisição CEP");
    }
    const data = await resp.json();
    if (data.erro) {
      throw new Error("CEP não encontrado");
    }
    return data; 
  }

export function PersonalInfoSecondStep({
    form,
}: {
    form: FormInstance<PersonalInfo>;
}) {
    const cepValue = Form.useWatch("postalCode", form);
    const [cepLookupStatus, setCepLookupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const cleanedCep = (cepValue ?? "").replace(/\D/g, "");
    const showAddressFields = cleanedCep.length === 8;

    useEffect(() => {
        const addressFields = {
            address: "",
            addressNeighborhood: "",
            addressCity: "",
            addressState: "",
            addressCountry: "",
        };

        if (cleanedCep.length !== 8) {
            form.setFieldsValue(addressFields);
            setCepLookupStatus("idle");
            return;
        }

        const controller = new AbortController();
        let timedOut = false;
        const timeoutId = window.setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, 8000);
        form.setFieldsValue(addressFields);
        setCepLookupStatus("loading");

        fetchAddressByCep(cleanedCep, controller.signal)
            .then((data) => {
                form.setFieldsValue({
                    address: data.logradouro ?? "",
                    addressNeighborhood: data.bairro ?? "",
                    addressCity: data.localidade ?? "",
                    addressState: data.uf ?? "",
                    addressCountry: "Brasil",
                });
                setCepLookupStatus("success");
            })
            .catch(() => {
                if (controller.signal.aborted && !timedOut) return;
                form.setFieldsValue(addressFields);
                setCepLookupStatus("error");
            })
            .finally(() => window.clearTimeout(timeoutId));

        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [cleanedCep, form]);

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
                        style={{ flex: showAddressFields ? 0.2 : 0.34 }}
                        label="CEP"
                        name="postalCode"
                        rules={[{ required: true, message: "Por favor preencha seu cep" }]}
                    >
                        <MaskedInput mask="_____-___" replacement={{ _: /\d/ }} />
                    </Form.Item>

                    {showAddressFields && (
                        <Form.Item
                            style={{ flex: 0.4 }}
                            label="Rua"
                            name="address"
                            rules={[{ required: true, message: "Por favor preencha seu endereço" }]}
                        >
                            <Input disabled={cepLookupStatus === "loading"} />
                        </Form.Item>
                    )}

                    <Form.Item
                        style={{ flex: showAddressFields ? 0.15 : 0.25 }}
                        label="Número"
                        name="addressNumber"
                        rules={[{ required: true, message: "Por favor preencha o número" }]}
                    >
                        <Input />
                    </Form.Item>

                    
                    <Form.Item
                        style={{ flex: showAddressFields ? 0.25 : 0.41 }}
                        label="Complemento"
                        name="addressComplement"
                    >
                        <Input />
                    </Form.Item>

                </Flex>

                {showAddressFields && (
                    <>
                        {cepLookupStatus === "loading" && <Spin size="small" tip="Buscando endereço pelo CEP..." />}
                        {cepLookupStatus === "error" && (
                            <Alert
                                type="info"
                                showIcon
                                message="Não encontramos esse CEP. Preencha o endereço manualmente."
                                style={{ marginBottom: 16 }}
                            />
                        )}
                        <Flex gap={12}>
                            <Form.Item
                                style={{ flex: 0.35 }}
                                label="Bairro"
                                name="addressNeighborhood"
                                rules={[{ required: true, message: "Por favor preencha seu bairro" }]}
                            >
                                <Input disabled={cepLookupStatus === "loading"} />
                            </Form.Item>
                            <Form.Item
                                style={{ flex: 0.35 }}
                                label="Cidade"
                                name="addressCity"
                                rules={[{ required: true, message: "Por favor preencha sua cidade" }]}
                            >
                                <Input disabled={cepLookupStatus === "loading"} />
                            </Form.Item>

                            <Form.Item
                                style={{ flex: 0.15 }}
                                label="Estado"
                                name="addressState"
                                rules={[{ required: true, message: "Por favor preencha seu estado" }]}
                            >
                                <Input disabled={cepLookupStatus === "loading"} />
                            </Form.Item>
                            <Form.Item
                                style={{ flex: 0.25 }}
                                label="País"
                                name="addressCountry"
                                rules={[{ required: true, message: "Por favor preencha seu país" }]}
                            >
                                <Input disabled={cepLookupStatus === "loading"} />
                            </Form.Item>
                        </Flex>
                    </>
                )}

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
