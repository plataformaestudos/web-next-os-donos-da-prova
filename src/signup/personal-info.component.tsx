import { Alert, Form, FormInstance, Input, Spin } from "antd";

import { MaskedInput } from "@/ui/masked-input/masked-input.component";
import { PasswordField, PasswordRequirements } from "./password-fields";
import { useEffect, useId, useState } from "react";
import {
    AddressDetails,
    AddressDetailsGrid,
    AddressGrid,
    AddressLookupStatus,
    FieldGroup,
    IdentificationGrid,
    PasswordGrid,
    PersonalInfoFields,
} from "./personal-info.style";

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
    const passwordRequirementsId = useId();
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
        <Form<PersonalInfo>
            form={form}
            name="personal-info"
            autoComplete="off"
            layout="vertical"
        >
            <PersonalInfoFields>
                <FieldGroup>
                    <legend>Identificação</legend>
                    <IdentificationGrid>
                        <Form.Item
                            label="Nome completo"
                            name="name"
                            rules={[{ required: true, message: "Por favor preencha seu nome" }]}
                        >
                            <Input placeholder="Seu nome completo" autoComplete="name" />
                        </Form.Item>
                        <Form.Item
                            label="CPF"
                            name="cpf"
                            rules={[{ required: true, message: "Por favor preencha seu CPF" }]}
                        >
                            <MaskedInput
                                mask="___.___.___-__"
                                replacement={{ _: /\d/ }}
                                placeholder="000.000.000-00"
                                inputMode="numeric"
                                autoComplete="off"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Telefone"
                            name="phone"
                            rules={[{ required: true, message: "Por favor preencha seu telefone" }]}
                        >
                            <MaskedInput
                                mask="(__) _____-____"
                                replacement={{ _: /\d/ }}
                                placeholder="(00) 00000-0000"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel-national"
                            />
                        </Form.Item>
                        <Form.Item
                            label="E-mail"
                            name="email"
                            rules={[{ required: true, message: "Por favor preencha o e-mail" }]}
                        >
                            <Input
                                placeholder="seu@email.com"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck={false}
                            />
                        </Form.Item>
                    </IdentificationGrid>
                </FieldGroup>

                <FieldGroup>
                    <legend>Endereço</legend>
                    <AddressGrid>
                        <Form.Item
                            label="CEP"
                            name="postalCode"
                            rules={[{ required: true, message: "Por favor preencha seu CEP" }]}
                        >
                            <MaskedInput
                                mask="_____-___"
                                replacement={{ _: /\d/ }}
                                placeholder="00000-000"
                                inputMode="numeric"
                                autoComplete="postal-code"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Número"
                            name="addressNumber"
                            rules={[{ required: true, message: "Por favor preencha o número" }]}
                        >
                            <Input placeholder="Número do imóvel" autoComplete="off" />
                        </Form.Item>
                        <Form.Item label="Complemento (opcional)" name="addressComplement">
                            <Input
                                placeholder="Apartamento, bloco, referência..."
                                autoComplete="address-line2"
                            />
                        </Form.Item>
                    </AddressGrid>

                    {showAddressFields && (
                        <AddressDetails>
                            {cepLookupStatus === "loading" && (
                                <AddressLookupStatus role="status" aria-live="polite">
                                    <Spin size="small" />
                                    <span>Buscando endereço pelo CEP...</span>
                                </AddressLookupStatus>
                            )}
                            {cepLookupStatus === "error" && (
                                <div role="status" aria-live="polite">
                                    <Alert
                                        type="info"
                                        showIcon
                                        message="Não encontramos esse CEP. Preencha o endereço manualmente."
                                    />
                                </div>
                            )}
                            <Form.Item
                                label="Rua"
                                name="address"
                                rules={[{ required: true, message: "Por favor preencha seu endereço" }]}
                            >
                                <Input
                                    placeholder="Nome da rua ou avenida"
                                    autoComplete="address-line1"
                                    disabled={cepLookupStatus === "loading"}
                                />
                            </Form.Item>
                            <AddressDetailsGrid>
                                <Form.Item
                                    label="Bairro"
                                    name="addressNeighborhood"
                                    rules={[{ required: true, message: "Por favor preencha seu bairro" }]}
                                >
                                    <Input placeholder="Seu bairro" disabled={cepLookupStatus === "loading"} />
                                </Form.Item>
                                <Form.Item
                                    label="Cidade"
                                    name="addressCity"
                                    rules={[{ required: true, message: "Por favor preencha sua cidade" }]}
                                >
                                    <Input
                                        placeholder="Sua cidade"
                                        autoComplete="address-level2"
                                        disabled={cepLookupStatus === "loading"}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Estado"
                                    name="addressState"
                                    rules={[{ required: true, message: "Por favor preencha seu estado" }]}
                                >
                                    <Input
                                        placeholder="UF"
                                        autoComplete="address-level1"
                                        disabled={cepLookupStatus === "loading"}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="País"
                                    name="addressCountry"
                                    rules={[{ required: true, message: "Por favor preencha seu país" }]}
                                >
                                    <Input
                                        placeholder="Seu país"
                                        autoComplete="country-name"
                                        disabled={cepLookupStatus === "loading"}
                                    />
                                </Form.Item>
                            </AddressDetailsGrid>
                        </AddressDetails>
                    )}
                </FieldGroup>

                <FieldGroup>
                    <legend>Acesso à plataforma</legend>
                    <PasswordGrid>
                        <PasswordField form={form} requirementsId={passwordRequirementsId} />
                        <Form.Item
                            label="Confirmar a senha"
                            name="confirmPassword"
                            dependencies={["password"]}
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
                            <Input.Password
                                placeholder="Repita sua senha"
                                autoComplete="new-password"
                                aria-describedby={passwordRequirementsId}
                                aria-details={passwordRequirementsId}
                            />
                        </Form.Item>
                    </PasswordGrid>
                    <PasswordRequirements form={form} id={passwordRequirementsId} />
                </FieldGroup>
            </PersonalInfoFields>
        </Form>
    );
}
