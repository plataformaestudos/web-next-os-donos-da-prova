"use client";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Steps, Typography } from "antd";
import { Card, Container, Content, Footer, Header, Span } from "./signup.style";
import { PaymentInfo, PaymentInfoThirdStep } from "./payment-info.component";
import {
  PersonalInfo,
  PersonalInfoSecondStep,
} from "./personal-info.component";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ChoosePlanFirstStep, CycleSelector } from "./choose-plan.component";
import { TermsCheckbox } from "./terms-checkbox.component";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import { ReferralQuote } from "@/affiliates/referral-quote.component";
import { isReferralCheckoutReady, ReferralReadiness, referralRequestQueue } from "@/affiliates/referral-request-queue";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const pendingReferralRequests = useSyncExternalStore(referralRequestQueue.subscribe, referralRequestQueue.getPending, () => 0);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const router = useRouter();

  const [campaignUnavailable, setCampaignUnavailable] = useState(false);
  useEffect(() => { setCampaignUnavailable(new URLSearchParams(window.location.search).get("campaign") === "unavailable"); }, []);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<string>("YEARLY");
  const [referralReadiness, setReferralReadiness] = useState<ReferralReadiness | null>(null);
  const referralReadinessRef = useRef<ReferralReadiness | null>(null);
  const handleReferralReadiness = useCallback((readiness: ReferralReadiness) => {
    referralReadinessRef.current = readiness;
    setReferralReadiness(readiness);
  }, []);
  const invalidateReferral = () => {
    referralReadinessRef.current = null;
    setReferralReadiness(null);
  };

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
    if (cycles.length && !cycles.some(item => item.value === selectedCycle)) {
      referralReadinessRef.current = null;
      setReferralReadiness(null);
      setSelectedCycle(cycles[0].value);
    }
  }, [selectedPlanData, selectedCycle]);

  const isPlanFree = useMemo(() => {
    return selectedPlanData?.isFree ?? false;
  }, [selectedPlanData]);

  const isDisabled = useMemo(() => {
    return (
      pendingReferralRequests > 0 ||
      (currentStep === 1 && !selectedPlan) ||
      (currentStep === 2 && !personalInfoFormValid) ||
      (currentStep === 3 && !isPlanFree && (!paymentInfoFormValid || !termsAccepted || !autoBillingAccepted || !isReferralCheckoutReady(referralReadiness, selectedPlan || "", selectedCycle)))
    );
  }, [currentStep, selectedPlan, selectedCycle, personalInfoFormValid, paymentInfoFormValid, termsAccepted, autoBillingAccepted, isPlanFree, referralReadiness, pendingReferralRequests]);

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
                if (submittingRef.current) return;
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
                        disabled: isSubmitting,
                      },
                      {
                        title: "Dados pessoais",
                        disabled: isSubmitting || !selectedPlan,
                      },
                    ]
                  : [
                      {
                        title: "Plano",
                        disabled: isSubmitting,
                      },
                      {
                        title: "Dados pessoais",
                        disabled: isSubmitting || !selectedPlan,
                      },
                      {
                        title: "Pagamento",
                        disabled: isSubmitting || !personalInfoFormValid,
                      },
                    ]
              }
            />
          )}
        </Header>
        <Divider />
        <Content inert={isSubmitting}>
          {campaignUnavailable && <Typography.Paragraph type="warning">Este link de campanha não está disponível. Você pode escolher um plano pelo valor regular.</Typography.Paragraph>}
          <div
            style={{
              display: currentStep === 1 ? "block" : "none",
            }}
          >
            <ChoosePlanFirstStep
              plans={plans}
              selectedPlan={selectedPlan}
              onSelectPlan={planId => { if (planId !== selectedPlan) { invalidateReferral(); setSelectedPlan(planId); } }}
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
                    onCycleChange={cycle => { if (cycle !== selectedCycle) { invalidateReferral(); setSelectedCycle(cycle); } }}
                  />
                  <ReferralQuote planId={selectedPlanData.id} cycle={selectedCycle} onReadinessChange={handleReferralReadiness} disabled={isPending || isSubmitting} />
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
              disabled={isSubmitting || isPending}
              onClick={() => { if (!submittingRef.current) setCurrentStep(currentStep - 1); }}
            >
              Voltar
            </Button>
          )}
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            disabled={isDisabled || isPending || isSubmitting}
            loading={isPending || isSubmitting}
            onClick={() => {
              if (submittingRef.current) return;
              const isLastStep = isPlanFree ? currentStep === 2 : currentStep === 3;
              
              if (isLastStep) {
                if (referralRequestQueue.getPending() > 0 || (!isPlanFree && !isReferralCheckoutReady(referralReadinessRef.current, selectedPlan || "", selectedCycle))) {
                  setError("Confira o código de desconto ou continue pelo valor regular antes de confirmar.");
                  return;
                }
                submittingRef.current = true;
                setIsSubmitting(true);
                startTransition(async () => {
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
                    } finally {
                      submittingRef.current = false;
                      setIsSubmitting(false);
                    }
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
