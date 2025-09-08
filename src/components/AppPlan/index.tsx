"use client";

import { PlanModel } from "@/model/plan.model";
import {
  Button,
  Descriptions,
  message,
  Typography,
  Form,
  Flex,
} from "antd";
import { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import { AppConfirmModal } from "../AppConfirmModal";
import HttpClient from "@/util/http-client/fetch-client.util";
import { AppLoading } from "../AppLoading";
import {
  PaymentInfo,
  PaymentInfoThirdStep,
} from "@/signup/payment-info.component";

interface AppPlanProps {
  plan: PlanModel;
  myPlan?: boolean;
}

const { Title } = Typography;

// const ProfileCard = styled(Card)`
//   background-color: #fff;
//   border-radius: 10px;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//   width: 100%;
//   min-width: 350px;
//   max-width: 350px;
//   height: fit-content;
// `;

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
  height: fit-content
  margin: 10px;
`;


const FlipCardInner = styled.div<{ flipped: boolean }>`
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform: ${({ flipped }) => (flipped ? "rotateY(180deg)" : "rotateY(0deg)")};
`;

const FlipCardFace = styled.div<{ back?: boolean }>`
  position: absolute;
  width: 100%;
  backface-visibility: hidden;
  background: ${({ theme }) => ( theme.colorBgContainer)};
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 250px;
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

export const AppPlan = ({ plan, myPlan }: AppPlanProps) => {
  const useForm = <T,>() => {
    const [isValid, setIsFormValid] = useState<boolean | null>(null);
    const [form] = Form.useForm<T>();
    const formValues = Form.useWatch([], form);

    useEffect(() => {
      form
        .validateFields({ validateOnly: true })
        .then(() => {
          console.log("Form is valid", isValid);
          setIsFormValid(true);
        })
        .catch(() => setIsFormValid(false));
    }, [form, formValues, isValid]);

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

  const {
    form: paymentInfoForm,
    values: paymentInfoValues,
    isValid: isPaymentInfoValid,
  } = useForm<PaymentInfo>();

  const handleFlip = () => setFlipped(!flipped);

  const handleCancelPlan = (planData: PlanModel) => {
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

  const handleSelectPlan = (planData: PlanModel) => {
    setModalProps({
      title: "Assinar novo plano",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <span>
            Tem certeza que deseja escolher o plano{" "}
            <strong>{planData.name}</strong> no valor de{" "}
            <strong>
              {Number(
                planData.month_value ?? planData.billingValue ?? 0
              ).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </strong>
            ?
            <br />
          </span>
          <PaymentInfoThirdStep formV={paymentInfoForm} />
        </div>
      ),
      onConfirm: () => subscribePlan(planData),
      onCancel: () => setModalProps({ ...modalProps, visible: false }),
      confirmText: "Sim, assinar",
      cancelText: "Não",
      visible: true,
      isDeclined: false,
    });
  };

  const handleUpdatePayment = (planData: PlanModel) => {
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
      onCancel: () => setModalProps({ ...modalProps, visible: false }),
      confirmText: "Sim, atualizar",
      cancelText: "Não",
      visible: true,
      isDeclined: false,
    });
  };

  async function cancelPlan(planData: PlanModel) {
    setIsLoading(true);
    return HttpClient.fetch(`/subscription/cancel/${planData.id}`, {
      method: "DELETE",
    })
      .then(() => {
        message.success("Plano cancelado com sucesso");
        setModalProps({ ...modalProps, visible: false });
        setTimeout(() => {
          window.location.reload();
        }, 200);
      })
      .catch(() => {
        message.error("Erro ao cancelar o plano");
      })
      .finally(() => setIsLoading(false));
  }

  async function subscribePlan(planData: PlanModel) {
    setIsLoading(true);
    if (!isPaymentInfoValid) {
      message.error("Por favor, preencha os dados de pagamento corretamente");
      setIsLoading(false);
      return;
    }

    const payload = {
      planId: planData.id,
      saveCard: paymentInfoValues.saveCard,
      billingType: "CREDIT_CARD",
      cycle: planData.billingRecurrencyType ?? "MONTHLY",
      description: planData?.description ?? "",
      creditCard: {
        holderName: paymentInfoValues.holderName,
        number: paymentInfoValues.number,
        expiryMonth: paymentInfoValues.expiryDate.split("/")[0],
        expiryYear: paymentInfoValues.expiryDate.split("/")[1],
        ccv: paymentInfoValues.cvv,
      },
    };

    return HttpClient.fetch(`/subscription`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then(() => {
        message.success("Plano assinado com sucesso");
        setModalProps({ ...modalProps, visible: false });
        setTimeout(() => {
          window.location.reload();
        }, 200);
      })
      .catch(() => {
        message.error("Erro ao assinar o plano");
      })
      .finally(() => setIsLoading(false));
  }

  async function updatePlan(planData: PlanModel) {
    setIsLoading(true);

    if (!isPaymentInfoValid) {
      message.error("Por favor, preencha os dados de pagamento corretamente");
      setIsLoading(false);
      return;
    }

    const payload = {
      planId: planData.id,
      saveCard: paymentInfoValues.saveCard,
      billingType: "CREDIT_CARD",
      cycle: planData.billingRecurrencyType ?? "MONTHLY",
      description: planData?.description ?? "",
      creditCard: {
        holderName: paymentInfoValues.holderName,
        number: paymentInfoValues.number,
        expiryMonth: paymentInfoValues.expiryDate.split("/")[0],
        expiryYear: paymentInfoValues.expiryDate.split("/")[1],
        ccv: paymentInfoValues.cvv,
      },
    };

    return HttpClient.fetch(`/subscription/update-credit-card`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
      .then(() => {
        message.success("Dados de pagamento atualizados com sucesso");
        setModalProps({ ...modalProps, visible: false });
        setTimeout(() => {
          window.location.reload();
        }, 200);
      })
      .catch(() => {
        message.error("Erro ao atualizar os dados de pagamento");
      })
      .finally(() => setIsLoading(false));
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
              <Descriptions.Item label="Valor">
                {Number(plan?.month_value ?? plan?.billingValue ?? 0).toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Limite de questões">
                {plan?.question_limit || 0}
              </Descriptions.Item>
            </Descriptions>
            <ButtonContent>
              {myPlan ? (
                <Flex
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
                </Flex>
              ) : (
                <Flex
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
                </Flex>
              )}
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
