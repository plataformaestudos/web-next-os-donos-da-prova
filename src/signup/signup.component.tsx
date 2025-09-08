"use client";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Steps, Typography } from "antd";
import { Card, Container, Content, Footer, Header } from "./signup.style";
import { PaymentInfo, PaymentInfoThirdStep } from "./payment-info.component";
import {
  PersonalInfo,
  PersonalInfoSecondStep,
} from "./personal-info.component";
import { useEffect, useMemo, useState, useTransition } from "react";

import { ChoosePlanFirstStep } from "./choose-plan.component";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import { signup } from "./signup.action";
import { useIsMobile } from "@/util/use-media-query.hook";

const useForm = <T,>() => {
  const [isValid, setIsFormValid] = useState<boolean | null>(null);
  const [form] = Form.useForm<T>();
  const formValues = Form.useWatch([], form);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setIsFormValid(true))
      .catch(() => setIsFormValid(false));
  }, [form, formValues]);

  return {
    form,
    values: formValues,
    isValid,
  };
};

export default function SignupSteps({
  plans,
}: {
  plans: {
    id: string;
    name: string;
    description: string;
    price: number;
    modules: {
      name: string;
    }[];
  }[];
}) {
  const isMobile = useIsMobile();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const {
    form: personalInfoForm,
    values: personalInfo,
    isValid: personalInfoFormValid,
  } = useForm<PersonalInfo>();
  const {
    form: paymentInfoForm,
    values: paymentInfo,
    isValid: paymentInfoFormValid,
  } = useForm<PaymentInfo>();

  const isDisabled = useMemo(() => {
    return (
      (currentStep === 1 && !selectedPlan) ||
      (currentStep === 2 && !personalInfoFormValid) ||
      (currentStep === 3 && !paymentInfoFormValid)
    );
  }, [currentStep, selectedPlan, personalInfoFormValid, paymentInfoFormValid]);

  return (
    <Container>
      <Card>
        <Header>
          <Title level={2} style={{ marginBottom: 24, marginTop: 8 }}>
            Cadastro
          </Title>
          {isMobile !== null && (
            <Steps
              responsive={false}
              type={isMobile ? "inline" : "default"}
              current={currentStep - 1}
              onChange={(step) => {
                if (
                  (step === 1 && !selectedPlan) ||
                  (step === 2 && !personalInfoFormValid)
                ) {
                  return;
                }
                setCurrentStep(step + 1);
              }}
              items={[
                {
                  title: "Plano",
                },
                {
                  title: "Dados pessoais",
                  disabled: !selectedPlan,
                },
                {
                  title: "Pagamento",
                  disabled: !personalInfoFormValid,
                },
              ]}
            />
          )}
        </Header>
        <Divider />
        <Content>
          <div
            style={{
              display: currentStep === 1 ? "block" : "none",
            }}
          >
            <ChoosePlanFirstStep
              plans={plans}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
            />
          </div>
          <div
            style={{
              display: currentStep === 2 ? "block" : "none",
            }}
          >
            <PersonalInfoSecondStep form={personalInfoForm} />
          </div>
          <div
            style={{
              display: currentStep === 3 ? "block" : "none",
            }}
          >
            <PaymentInfoThirdStep formV={paymentInfoForm} />
          </div>

          {error && <Typography.Text type="danger">{error}</Typography.Text>}
        </Content>
        <Footer>
          {currentStep > 1 && (
            <Button
              style={{ padding: 0 }}
              type="link"
              icon={<ArrowLeftOutlined />}
              iconPosition="start"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Voltar
            </Button>
          )}
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            disabled={isDisabled || isPending}
            loading={isPending}
            onClick={() => {
              if (currentStep === 3) {
                startTransition(async () => {
                  const { error } = await signup({
                    planId: selectedPlan as string,
                    saveCard: paymentInfo.saveCard,
                    billingType: "CREDIT_CARD",
                    cycle: "MONTHLY",
                    description: "",
                    userInfo: {
                      ...personalInfo,
                      cpfCnpj: personalInfo.cpf,
                    },
                    creditCard: {
                      holderName: paymentInfo.holderName,
                      number: paymentInfo.number,
                      expiryMonth: paymentInfo.expiryDate.split("/")[0],
                      expiryYear: paymentInfo.expiryDate.split("/")[1],
                      ccv: paymentInfo.cvv,
                    },
                  });
                  setError(error);
                });
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            style={{ marginLeft: "auto", padding: 0 }}
          >
            Confirmar
          </Button>
        </Footer>
      </Card>

      <Link href="/login">
        <span>Já tenho uma conta</span>
      </Link>
    </Container>
  );
}
