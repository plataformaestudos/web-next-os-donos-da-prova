"use client";

import { NewPlanModel } from "@/model/plan.model";
import {
    Button,
    Descriptions,
    Typography,
    Form,
    FormInstance,
    App,
    Select,
    Collapse,
    Checkbox,
} from "antd";
import { ReactNode, useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Link from "next/link";
import { AppConfirmModal } from "../AppConfirmModal";
import HttpClient from "@/util/http-client/fetch-client.util";
import { AppLoading } from "../AppLoading";
import {
    PaymentInfo,
    PaymentInfoThirdStep,
} from "@/signup/payment-info.component";

const { Panel } = Collapse;
const { Title } = Typography;

const ProfileTitle = styled(Title)`
  color: #1890ff;
  text-align: center;
`;

const ButtonContent = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const FlipCardContainer = styled.div`
  perspective: 1000px;
  width: 100%;
  min-width: 350px;
  max-width: 350px;
  margin: 10px;
  flex: 0 0 auto;
`;

const FlipCardInner = styled.div<{ flipped: boolean }>`
  position: relative;
  width: 100%;
  height: fit-content;
  min-height: 400px;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform: ${({ flipped }) => (flipped ? "rotateY(180deg)" : "rotateY(0deg)")};
`;

const FlipCardFace = styled.div<{ back?: boolean }>`
  position: absolute;
  width: 100%;
  height: fit-content;
  min-height: 400px;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  background: ${({ theme }) => (theme.colorBgContainer)};
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: ${({ back }) => (back ? "rotateY(180deg)" : "none")};
`;

interface ModalProps {
    title: string;
    content: ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    visible: boolean;
    isDeclined?: boolean;
}

export const AppPlanCardNewPlan = ({ plan }: { plan: NewPlanModel }) => {
    const app = App.useApp?.();
    const message = app?.message;
    const useForm = <T,>() => {
        const [isValid, setIsFormValid] = useState<boolean | null>(null);
        const [form] = Form.useForm<T>();
        const formValues = Form.useWatch([], form);

        useEffect(() => {
            if (formValues) {
                form
                    .validateFields({ validateOnly: true })
                    .then(() => {
                        setIsFormValid(true);
                    })
                    .catch(() => setIsFormValid(false));
            }
        }, [form, formValues]);

        return {
            form,
            values: formValues,
            isValid,
        };
    };

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalProps, setModalProps] = useState<ModalProps>({
        title: "",
        content: "",
        onConfirm: () => { },
        onCancel: () => { },
        confirmText: "Confirmar",
        cancelText: "Cancelar",
        visible: false,
        isDeclined: false,
    });

    const [flipped, setFlipped] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState<string>("YEARLY");
    const [allTermsAccepted, setAllTermsAccepted] = useState(false);
    const allTermsAcceptedRef = useRef(false);

    const {
        form: paymentInfoForm,
        values: paymentInfoValues,
        isValid: isPaymentInfoValid,
    } = useForm<PaymentInfo>();

    const handleFlip = () => setFlipped(!flipped);

    const getCycleInstallments = (cycleValue: string) => {
        switch (cycleValue) {
            case "MONTHLY":
                return 1;
            case "QUARTERLY":
                return 3;
            case "SEMIANNUALLY":
                return 6;
            case "YEARLY":
                return 12;
            case "LIFETIME":
                return 1;
            default:
                return 1;
        }
    };

    const getAvailableCycles = (planData: NewPlanModel) => {
        const cycles = [];
        if (planData.monthValue) {
            cycles.push({ 
                value: "MONTHLY", 
                label: "Mensal", 
                price: planData.monthValue,
                installments: getCycleInstallments("MONTHLY")
            });
        }
        if (planData.quarterlyValue) {
            cycles.push({ 
                value: "QUARTERLY", 
                label: "Trimestral", 
                price: planData.quarterlyValue,
                installments: getCycleInstallments("QUARTERLY")
            });
        }
        if (planData.semiannualValue) {
            cycles.push({ 
                value: "SEMIANNUALLY", 
                label: "Semestral", 
                price: planData.semiannualValue,
                installments: getCycleInstallments("SEMIANNUALLY")
            });
        }
        if (planData.annualValue) {
            cycles.push({ 
                value: "YEARLY", 
                label: "Anual", 
                price: planData.annualValue,
                installments: getCycleInstallments("YEARLY")
            });
        }
        if (planData.lifetimeValue && planData.allowLifetime) {
            cycles.push({ 
                value: "LIFETIME", 
                label: "Vitalício", 
                price: planData.lifetimeValue,
                installments: getCycleInstallments("LIFETIME")
            });
        }
        return cycles;
    };

    const resetModal = () => {
        console.log("resetModal");
        setAllTermsAccepted(false);
        allTermsAcceptedRef.current = false;
        setSelectedCycle("YEARLY");
        paymentInfoForm.resetFields();
    };

    const handleSelectPlan = (planData: NewPlanModel) => {
        const availableCycles = getAvailableCycles(planData);

        // Resetar ciclo se não estiver disponível
        if (availableCycles.length > 0 && !availableCycles.find(c => c.value === selectedCycle)) {
            setSelectedCycle(availableCycles[0].value);
        }

        // Determinar qual ciclo tem o maior período (melhor custo benefício)
        const cycleOrder = ["MONTHLY", "QUARTERLY", "SEMIANNUALLY", "YEARLY", "LIFETIME"];
        const getCycleIndex = (value: string) => cycleOrder.indexOf(value);
        const bestValueCycle = [...getAvailableCycles(planData)].sort((a, b) =>
            getCycleIndex(b.value) - getCycleIndex(a.value)
        )[0]?.value;

        // Componente interno do modal que tem acesso aos availableCycles
        const ModalContent = () => {
            const cycles = getAvailableCycles(planData);

            // Estado local para o ciclo selecionado dentro do modal
            const [localSelectedCycle, setLocalSelectedCycle] = useState(
                cycles.find(c => c.value === selectedCycle) ? selectedCycle : cycles[0]?.value || "YEARLY"
            );

            // Estado local único para os termos
            const [localAllTermsAccepted, setLocalAllTermsAccepted] = useState(allTermsAccepted);

            return (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <span>
                            Escolha a assinatura para o plano{" "}
                            <strong>{planData.name}</strong>:
                        </span>
                        {cycles.length > 0 ? (
                            <>
                                <Select
                                    value={localSelectedCycle}
                                    onChange={(value) => {
                                        setLocalSelectedCycle(value);
                                        setSelectedCycle(value);
                                    }}
                                    style={{ width: "100%" }}
                                    placeholder="Selecione uma assinatura"
                                    optionLabelProp="label"
                                    optionRender={(option) => {
                                        const cycle = cycles.find(c => c.value === option.value);
                                        const isLifetime = cycle?.value === "LIFETIME";
                                        return (
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                                                <span>
                                                    {cycle?.label} - {isLifetime ? "Pagamento único de " : `${cycle?.installments}x de `}
                                                    {Number(cycle?.price || 0).toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })}
                                                </span>
                                                {option.value === bestValueCycle && (
                                                    <span style={{
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        padding: "2px 6px",
                                                        borderRadius: "4px",
                                                    }}>
                                                        ⭐ Melhor custo-benefício
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    }}
                                >
                                    {cycles.map((cycle) => {
                                        const isLifetime = cycle.value === "LIFETIME";
                                        return (
                                            <Select.Option
                                                key={cycle.value}
                                                value={cycle.value}
                                                label={`${cycle.label} - ${isLifetime ? "Pagamento único de " : `${cycle.installments}x de `}${Number(cycle.price).toLocaleString("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                })}${cycle.value === bestValueCycle ? " ⭐" : ""}`}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                                                    <span>
                                                        {cycle.label} - {isLifetime ? "Pagamento único de " : `${cycle.installments}x de `}
                                                        {Number(cycle.price).toLocaleString("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        })}
                                                    </span>
                                                    {cycle.value === bestValueCycle && (
                                                        <span style={{
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 4,
                                                            padding: "2px 6px",
                                                            borderRadius: "4px",
                                                        }}>
                                                            ⭐ Melhor custo-benefício
                                                        </span>
                                                    )}
                                                </div>
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                                
                            </>
                        ) : (
                            <div style={{ color: "#ff4d4f", fontSize: 14 }}>
                                Nenhuma assinatura disponível para este plano.
                            </div>
                        )}
                    </div>

                    <Collapse>
                        <Panel header="Dados de pagamento" key="payment">
                            <PaymentInfoThirdStep formV={paymentInfoForm} />
                        </Panel>
                    </Collapse>

                    <div style={{ marginTop: 16 }}>
                        <Checkbox
                            checked={localAllTermsAccepted}
                            onChange={(e) => {
                                const isChecked = e.target.checked;
                                console.log(isChecked);
                                setLocalAllTermsAccepted(isChecked);
                                setAllTermsAccepted(isChecked);
                                allTermsAcceptedRef.current = isChecked;
                            }}
                        >
                            Li e concordo com os{" "}
                            <Link href="/termos-e-politicas" target="_blank" style={{ color: "#1890ff", textDecoration: "underline" }}>
                                termos e políticas
                            </Link>
                        </Checkbox>
                    </div>
                </div>
            );
        };

        setModalProps({
            title: "Assinar novo plano",
            content: <ModalContent />,
            onConfirm: () => subscribePlan(planData, paymentInfoForm, allTermsAcceptedRef.current),
            onCancel: () => {
                resetModal();
                setModalProps({ ...modalProps, visible: false });
            },
            confirmText: "Sim, assinar",
            cancelText: "Não",
            visible: true,
            isDeclined: false,
        });
    };

    async function subscribePlan(planData: NewPlanModel, paymentInfoForm: FormInstance<PaymentInfo>, termsAccepted: boolean) {
        setIsLoading(true);

        console.log(termsAccepted);
        // Validar termos de aceite
        if (!termsAccepted) {
            message.error("Por favor, aceite os termos e condições");
            setIsLoading(false);
            return;
        }

        if (!isPaymentInfoValid) {
            message.error("Por favor, preencha os dados de pagamento corretamente");
            setIsLoading(false);
            return;
        }
        const paymentData = paymentInfoForm.getFieldsValue() as PaymentInfo;
        if (!paymentData || !paymentData.expiryDate) {
            message.error("Por favor, preencha todos os dados de pagamento");
            setIsLoading(false);
            return;
        }

        const payload = {
            planId: planData.id,
            saveCard: paymentData.saveCard || false,
            billingType: "CREDIT_CARD",
            cycle: selectedCycle,
            description: planData?.description ?? "",
            creditCard: {
                holderName: paymentData.holderName,
                number: paymentData.number,
                expiryMonth: paymentData.expiryDate.split("/")[0],
                expiryYear: paymentData.expiryDate.split("/")[1],
                ccv: paymentData.cvv,
            },
            termsAccepted: termsAccepted,
            privacyAccepted: termsAccepted,
            autoChargeAccepted: termsAccepted,
            cancellationPolicyAccepted: termsAccepted,
        };

        try {
            await HttpClient.fetch(`/subscription`, {
                method: "POST",
                body: JSON.stringify(payload),
            },
                false
            );
            message.success("Plano assinado com sucesso");
            resetModal();
            setModalProps({ ...modalProps, visible: false });
            setTimeout(() => window.location.reload(), 200);
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <FlipCardContainer>
            <FlipCardInner flipped={flipped}>
                <FlipCardFace>
                    <ProfileTitle level={3}>
                        {plan?.name ?? plan?.name ?? "Nome não informado"}
                    </ProfileTitle>
                    <p style={{ textAlign: "center", marginBottom: "16px" }}>
                        {plan?.description ??
                            plan?.description ??
                            "Descrição não informada"}
                    </p>

                    <Descriptions
                        bordered
                        column={1}
                    >
                        <Descriptions.Item label="A partir de">
                            {(() => {
                                const values = [
                                    plan?.monthValue,
                                    plan?.quarterlyValue ? plan.quarterlyValue : null,
                                    plan?.semiannualValue ? plan.semiannualValue : null,
                                    plan?.annualValue ? plan.annualValue : null,
                                ].filter((v): v is number => v !== null && v !== undefined && !isNaN(v));

                                const minValue = values.length > 0 ? Math.min(...values) : 0;
                                return Number(minValue).toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency: "BRL",
                                    }
                                );
                            })()}/mês
                        </Descriptions.Item>
                        {plan?.allowLifetime && plan?.lifetimeValue && (
                            <Descriptions.Item label="Pagamento único">
                                {Number(plan.lifetimeValue).toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency: "BRL",
                                    }
                                )}
                            </Descriptions.Item>
                        )}
                        {plan?.questionLimit !== undefined && plan?.questionLimit !== 0 && (
                            <Descriptions.Item label="Limite de questões">
                                {plan.questionLimit}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                    <ButtonContent>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                            }}
                        >
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => handleSelectPlan(plan)}
                            >
                                Assinar Plano
                            </Button>
                            <Button type="default" size="large" onClick={handleFlip}>Ver Módulos</Button>
                        </div>
                    </ButtonContent>
                </FlipCardFace>
                <FlipCardFace back>
                    <ProfileTitle level={4}>Módulos do Plano</ProfileTitle>
                    {plan.modules && plan.modules.length > 0 ? (
                        <ul>
                            {plan.modules.map((mod) => <li key={mod.id}>{mod.name}</li>)}
                        </ul>
                    ) : <p>Nenhum módulo disponível</p>}

                    <ButtonContent>
                        <Button type="default" size="large" onClick={handleFlip}>Voltar</Button>
                    </ButtonContent>
                </FlipCardFace>
            </FlipCardInner>

            <AppConfirmModal
                title={modalProps.title}
                content={modalProps.content}
                confirmText={modalProps.confirmText}
                cancelText={modalProps.cancelText}
                visible={modalProps.visible}
                onConfirm={modalProps.onConfirm}
                onCancel={modalProps.onCancel}
                isDeclined={modalProps.isDeclined}
            />
            <AppLoading
                loadingModal
                show={isLoading}
            />
        </FlipCardContainer >
    );
};
