"use client";

import { updateSubscriptionCreditCard } from '@/subscription/update-credit-card';
import { MyPlanModel } from "@/model/plan.model";
import {
    Button,
    Descriptions,
    Typography,
    Form,
    App,
} from "antd";
import { ReactNode, useState } from "react";
import styled from "styled-components";
import { AppConfirmModal } from "../AppConfirmModal";
import HttpClient from "@/util/http-client/fetch-client.util";
import { AppLoading } from "../AppLoading";
import {
    PaymentInfo,
    PaymentInfoThirdStep,
} from "@/signup/payment-info.component";

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

export const AppPlanCardMyPlan = ({ plan }: { plan: MyPlanModel }) => {
    const app = App.useApp?.();
    const message = app?.message;
    const [paymentInfoForm] = Form.useForm<PaymentInfo>();

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

    const handleFlip = () => setFlipped(!flipped);

    const handleCancelPlan = (planData: MyPlanModel) => {
        setModalProps({
            title: "Cancelar Plano",
            content: (
                <span>
                    Tem certeza que deseja cancelar o plano{" "}
                    <strong>{planData.subscriptionPlan?.name}</strong>?
                </span>
            ),
            onConfirm: () => cancelPlan(planData),
            onCancel: () => setModalProps({ ...modalProps, visible: false }),
            confirmText: "Sim, cancelar",
            cancelText: "Não",
            visible: true,
            isDeclined: true,
        });
    };

    const handleUpdatePayment = (planData: MyPlanModel) => {
        paymentInfoForm.resetFields();
        setModalProps({
            title: "Atualizar dados de pagamento",
            content: (
                <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                    <span>
                        Tem certeza que deseja atualizar os dados de pagamento do plano{" "}
                        <strong>{planData.name}</strong>
                        ?
                        <br />
                    </span>
                    <PaymentInfoThirdStep formV={paymentInfoForm} />
                </div>
            ),
            onConfirm: () => updatePlan(planData),
            onCancel: () => {
                paymentInfoForm.resetFields();
                setModalProps(previous => ({ ...previous, visible: false }));
            },
            confirmText: "Sim, atualizar",
            cancelText: "Não",
            visible: true,
            isDeclined: false,
        });
    };

    async function cancelPlan(planData: MyPlanModel) {
        setIsLoading(true);
        try {
            await HttpClient.fetch(`/subscription/cancel/${planData.id}`, {
                method: "DELETE",
            },
                false
            );
            message.success("Plano cancelado com sucesso");
            setModalProps({ ...modalProps, visible: false });
            setTimeout(() => {
                window.location.reload();
            }, 200);
        } finally {
            setIsLoading(false);
        }
    }

    async function updatePlan(planData: MyPlanModel) {
        setIsLoading(true);
        try {
            await updateSubscriptionCreditCard(planData.id, paymentInfoForm);
            paymentInfoForm.resetFields();
            message.success("Dados de pagamento atualizados com sucesso");
            setModalProps(previous => ({ ...previous, visible: false }));
            setTimeout(() => window.location.reload(), 200);
        } catch (error) {
            if (error instanceof Error) message.error(error.message);
            else message.error("Por favor, preencha os dados de pagamento corretamente");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <FlipCardContainer>
            <FlipCardInner flipped={flipped}>
                <FlipCardFace>
                    <ProfileTitle level={3}>
                        {plan?.name ?? plan?.subscriptionPlan?.name ?? "Nome não informado"}
                    </ProfileTitle>
                    <p style={{ textAlign: "center", marginBottom: "16px" }}>
                        {plan?.description ??
                            plan?.subscriptionPlan?.description ??
                            "Descrição não informada"}
                    </p>

                    <Descriptions
                        bordered
                        column={1}
                    >
                        <Descriptions.Item label="Valor mensal">
                            {(() => {
                                const values = [
                                    plan?.subscriptionPlan?.monthValue,
                                    plan?.subscriptionPlan?.quarterlyValue ? plan.subscriptionPlan.quarterlyValue : null,
                                    plan?.subscriptionPlan?.semiannualValue ? plan.subscriptionPlan.semiannualValue: null,
                                    plan?.subscriptionPlan?.annualValue ? plan.subscriptionPlan.annualValue: null,
                                    plan?.billingValue ? plan.billingValue : null,
                                ].filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
                                
                                const minValue = values.length > 0 ? Math.min(...values) : 0;
                                return Number(minValue).toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency: "BRL",
                                    }
                                );
                            })()}
                        </Descriptions.Item>
                        {plan?.subscriptionPlan?.allowLifetime && plan?.subscriptionPlan?.lifetimeValue && (
                            <Descriptions.Item label="Pagamento único">
                                {Number(plan.subscriptionPlan.lifetimeValue).toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency: "BRL",
                                    }
                                )}
                            </Descriptions.Item>
                        )}
                        { plan?.subscriptionPlan?.questionLimit !== undefined && plan?.subscriptionPlan?.questionLimit !== 0 && (
                            <Descriptions.Item label="Limite de questões">
                                {plan.subscriptionPlan.questionLimit}
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
                                danger
                                onClick={() => handleCancelPlan(plan)}
                            >
                                Cancelar Plano
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => handleUpdatePayment(plan)}
                            >
                                Gerenciar pagamento
                            </Button>
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
