"use client";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Steps, Typography } from "antd";
import { Card, Container, Content, Footer, Header, Span } from "./signup.style";
import { PaymentInfo, PaymentInfoThirdStep } from "./payment-info.component";
import {
  PersonalInfo,
  PersonalInfoSecondStep,
} from "./personal-info.component";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ChoosePlanFirstStep, CycleSelector } from "./choose-plan.component";
import { TermsCheckbox } from "./terms-checkbox.component";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import { ReferralQuote } from "@/affiliates/referral-quote.component";
import { signUpClient } from "./signup.action";
import { useIsMobile } from "@/util/use-media-query.hook";
import { NewPlanModel } from "@/model/plan.model";
import { getPlanRecurringPrices } from "@/plans/plan-price-display";

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
  plans: NewPlanModel[];
}) {
  const isMobile = useIsMobile();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const router = useRouter();

  const [campaignUnavailable, setCampaignUnavailable] = useState(false);
  useEffect(() => { setCampaignUnavailable(new URLSearchParams(window.location.search).get("campaign") === "unavailable"); }, []);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<string>("YEARLY");

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

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [autoBillingAccepted, setAutoBillingAccepted] = useState(false);

  const selectedPlanData = useMemo(() => {
    return plans.find((p) => p.id === selectedPlan);
  }, [plans, selectedPlan]);

  useEffect(() => {
    if (!selectedPlanData || selectedPlanData.isFree) return;
    const cycles = getPlanRecurringPrices(selectedPlanData);
    if (cycles.length && !cycles.some(item => item.value === selectedCycle)) setSelectedCycle(cycles[0].value);
  }, [selectedPlanData, selectedCycle]);

  const isPlanFree = useMemo(() => {
    return selectedPlanData?.isFree ?? false;
  }, [selectedPlanData]);

  const isDisabled = useMemo(() => {
    return (
      (currentStep === 1 && !selectedPlan) ||
      (currentStep === 2 && !personalInfoFormValid) ||
      (currentStep === 3 && !isPlanFree && (!paymentInfoFormValid || !termsAccepted || !autoBillingAccepted))
    );
  }, [currentStep, selectedPlan, personalInfoFormValid, paymentInfoFormValid, termsAccepted, autoBillingAccepted, isPlanFree]);

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
              items={
                isPlanFree
                  ? [
                      {
                        title: "Plano",
                      },
                      {
                        title: "Dados pessoais",
                        disabled: !selectedPlan,
                      },
                    ]
                  : [
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
                    ]
              }
            />
          )}
        </Header>
        <Divider />
        <Content>
          {campaignUnavailable && <Typography.Paragraph type="warning">Este link de campanha não está disponível. Você pode escolher um plano pelo valor regular.</Typography.Paragraph>}
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
          {!isPlanFree && (
            <div
              style={{
                display: currentStep === 3 ? "block" : "none",
              }}
            >
              <Typography.Paragraph>
                Preencha as informações de pagamento
              </Typography.Paragraph>
              
              {selectedPlanData && (
                <div style={{ marginBottom: 20 }}>
                  <Typography.Text strong>Assinatura:</Typography.Text>
                  <CycleSelector
                    plan={selectedPlanData}
                    selectedCycle={selectedCycle}
                    onCycleChange={setSelectedCycle}
                  />
                  <ReferralQuote planId={selectedPlanData.id} cycle={selectedCycle} />
                </div>
              )}

              <PaymentInfoThirdStep formV={paymentInfoForm} />
              <TermsCheckbox 
                onAcceptanceChange={setTermsAccepted}
                onAutoBillingChange={setAutoBillingAccepted}
              />
            </div>
          )}

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
              const isLastStep = isPlanFree ? currentStep === 2 : currentStep === 3;
              
              if (isLastStep) {
                startTransition(() => {
                  (async () => {
                    try {
                      setError(null);
                      
                      const payload = isPlanFree
                        ? {
                            planId: selectedPlan as string,
                            saveCard: false,
                            billingType: "FREE" as const,
                            cycle: "MONTHLY",
                            description: "",
                            userInfo: {
                              ...personalInfo,
                              cpfCnpj: personalInfo.cpf,
                            },
                            creditCard: {
                              holderName: "",
                              number: "",
                              expiryMonth: "",
                              expiryYear: "",
                              ccv: "",
                            },
                            termsAccepted: true,
                            privacyAccepted: true,
                            autoChargeAccepted: true,
                            cancellationPolicyAccepted: true
                          }
                        : {
                            planId: selectedPlan as string,
                            saveCard: paymentInfo.saveCard,
                            billingType: "CREDIT_CARD" as const,
                            cycle: selectedCycle,
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
                            termsAccepted: termsAccepted,
                            privacyAccepted: termsAccepted,
                            autoChargeAccepted: autoBillingAccepted,
                            cancellationPolicyAccepted: autoBillingAccepted
                          };

                      const result = await signUpClient(payload);

                      if (result.success) {
                        router.push("/signup/success");
                      } else {
                        setError(result.error ?? "Erro desconhecido no cadastro");
                      }
                    } catch (err) {
                      console.error(err);
                      setError(err instanceof Error ? err.message : String(err));
                    }
                  })();
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
        <Span>Já tenho uma conta</Span>
      </Link>
    </Container>
  );
}
