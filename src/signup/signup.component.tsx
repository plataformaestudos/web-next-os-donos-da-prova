"use client";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Steps, Typography } from "antd";
import { Card, CheckoutLogin, Container, Content, Footer, Header, ProgressContainer, Span, StageDescription, StageHeading } from "./signup.style";
import { CheckoutBrand } from "./checkout-brand.component";
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
import { ReferralQuote } from "@/affiliates/referral-quote.component";
import { isReferralCheckoutReady, ReferralReadiness, referralRequestQueue } from "@/affiliates/referral-request-queue";
import { signUpClient } from "./signup.action";
import { clearSignupSuccessStatus, saveSignupSuccessStatus, signupSuccessStatus } from "./signup-success.state";
import { NewPlanModel } from "@/model/plan.model";
import { getPlanCardPrice, getPlanRecurringPrices } from "@/plans/plan-price-display";
import { ReferralPlansProvider, useReferralPlans } from "@/affiliates/referral-plans.component";

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
  return <ReferralPlansProvider><SignupStepsContent plans={plans} /></ReferralPlansProvider>;
}

function SignupStepsContent({ plans }: { plans: NewPlanModel[] }) {
  const referralPlans = useReferralPlans();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const pendingReferralRequests = useSyncExternalStore(referralRequestQueue.subscribe, referralRequestQueue.getPending, () => 0);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(currentStep);
  const router = useRouter();

  useEffect(() => { clearSignupSuccessStatus(); }, []);

  useEffect(() => {
    if (previousStep.current !== currentStep) {
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "auto" });
      previousStep.current = currentStep;
    }
  }, [currentStep]);

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
  const goToStep = (step: number) => {
    if (step === currentStep) return;
    invalidateReferral();
    setCurrentStep(step);
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
      (currentStep === 2 && (!selectedPlan || !personalInfoFormValid)) ||
      (currentStep === 3 && !isPlanFree && (!selectedPlan || !personalInfoFormValid || !paymentInfoFormValid || !termsAccepted || !autoBillingAccepted || !isReferralCheckoutReady(referralReadiness, selectedPlan || "", selectedCycle)))
    );
  }, [currentStep, selectedPlan, selectedCycle, personalInfoFormValid, paymentInfoFormValid, termsAccepted, autoBillingAccepted, isPlanFree, referralReadiness, pendingReferralRequests]);

  return (
    <Container>
      <CheckoutBrand />
      <Card as="section" aria-labelledby="checkout-heading">
        <Header>
          <ProgressContainer as="nav" aria-label="Etapas do cadastro">
            <Steps
              responsive={false}
              size="small"
              current={currentStep - 1}
              onChange={(step) => {
                if (submittingRef.current) return;
                if (
                  (step === 1 && !selectedPlan) ||
                  (step === 2 && (!selectedPlan || !personalInfoFormValid))
                ) {
                  return;
                }
                goToStep(step + 1);
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
                        disabled: isSubmitting || !selectedPlan || !personalInfoFormValid,
                      },
                    ]
              }
            />
          </ProgressContainer>
          <StageHeading id="checkout-heading" ref={headingRef} tabIndex={-1}>Cadastro</StageHeading>
          <StageDescription>
            {currentStep === 1 ? "Escolha o plano ideal para seus estudos." : currentStep === 2
              ? "Preencha seus dados para criar seu acesso à plataforma."
              : "Confira sua assinatura e preencha os dados de pagamento."}
          </StageDescription>
        </Header>
        <Content inert={isSubmitting} aria-busy={isPending || isSubmitting}>
          {campaignUnavailable && <Alert showIcon type="warning" message="Este link de campanha não está disponível. Você pode escolher um plano pelo valor regular." style={{ marginBottom: 20 }} />}
          <div
            style={{
              display: currentStep === 1 ? "block" : "none",
            }}
          >
            <ChoosePlanFirstStep
              plans={plans}
              selectedPlan={selectedPlan}
              onSelectPlan={planId => { if (planId !== selectedPlan) {
                invalidateReferral(); setSelectedPlan(planId);
                const plan = plans.find(item => item.id === planId);
                if (plan && !plan.isFree) setSelectedCycle(getPlanCardPrice(plan)?.cycle ?? "MONTHLY");
              } }}
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
              {selectedPlanData && (
                <section aria-label="Resumo da assinatura" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", minWidth: 0, gap: 16, marginBottom: 28 }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="signup-cycle"><Typography.Text strong>Assinatura selecionada</Typography.Text></label>
                    <Typography.Paragraph type="secondary" style={{ margin: "4px 0 0" }}>{selectedPlanData.name}</Typography.Paragraph>
                    <CycleSelector
                      id="signup-cycle"
                      disabled={isPending || isSubmitting}
                      plan={selectedPlanData}
                      selectedCycle={selectedCycle}
                      onCycleChange={cycle => { if (cycle !== selectedCycle) { invalidateReferral(); setSelectedCycle(cycle); } }}
                    />
                  </div>
                  {currentStep === 3 && <ReferralQuote planId={selectedPlanData.id} cycle={selectedCycle} onReadinessChange={handleReferralReadiness} disabled={isPending || isSubmitting}
                    hideCodeInput refreshKey={referralPlans?.revision} onOfferChange={referralPlans?.reconcileQuote} onReferralChange={() => referralPlans?.run("load")} />}
                </section>
              )}

              <PaymentInfoThirdStep formV={paymentInfoForm} />
              <TermsCheckbox 
                enabled={currentStep === 3}
                onAcceptanceChange={setTermsAccepted}
                onAutoBillingChange={setAutoBillingAccepted}
              />
            </div>
          )}

          {error && <Alert showIcon type="error" message={error} style={{ marginTop: 20 }} />}
        </Content>
        <Footer>
          {currentStep > 1 && (
            <Button
              style={{ padding: 0 }}
              type="link"
              icon={<ArrowLeftOutlined aria-hidden="true" />}
              iconPosition="start"
              disabled={isSubmitting || isPending}
              onClick={() => { if (!submittingRef.current) goToStep(currentStep - 1); }}
            >
              Voltar
            </Button>
          )}
          {currentStep === 1 && <Typography.Text type="secondary">Etapa 1 de {isPlanFree ? 2 : 3}</Typography.Text>}
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined aria-hidden="true" />}
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
                        saveSignupSuccessStatus(signupSuccessStatus(result.payload?.data?.emailConfirmationRequired));
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
                goToStep(currentStep + 1);
              }
            }}
            style={{ marginLeft: "auto" }}
          >
            {isPlanFree && currentStep === 2 ? "Criar conta" : currentStep === 3 ? "Confirmar e assinar" : "Continuar"}
          </Button>
        </Footer>
      </Card>

      <CheckoutLogin>Já tem uma conta? <Link href="/login"><Span>Entrar</Span></Link></CheckoutLogin>
    </Container>
  );
}
