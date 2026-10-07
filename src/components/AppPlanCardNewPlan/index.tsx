"use client";

import { NewPlanModel } from "@/model/plan.model";
import { getPlanCardPrice, getPlanRecurringPrices } from "@/plans/plan-price-display";
import {
    Button,
    Descriptions,
    Typography,
    Form,
    FormInstance,
    App,
    Checkbox,
} from "antd";
import { ReactNode, createContext, useCallback, useContext, useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Link from "next/link";
import { PlanCheckoutModal } from "./checkout.style";
import { ReferralQuote } from "@/affiliates/referral-quote.component";
import { isReferralCheckoutReady, ReferralReadiness } from "@/affiliates/referral-request-queue";
import { AppLoading } from "../AppLoading";
import {
    PaymentInfo,
    PaymentInfoThirdStep,
} from "@/signup/payment-info.component";
import { PaymentConsents } from "@/signup/payment-info.style";
import { CycleSelector } from "@/signup/choose-plan.component";

const { Title } = Typography;
const CheckoutSubmittingContext = createContext(false);

const ProfileTitle = styled(Title)`
  color: ${({ theme }) => theme.colorText};
  text-align: center;
`;

const ButtonContent = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const FlipCardContainer = styled.div`
  perspective: 1000px;
  width: min(350px, calc(100% - 20px));
  min-width: 0;
  max-width: 350px;
  margin: 10px;
  flex: 0 1 350px;
`;

const FlipCardInner = styled.div<{ $flipped: boolean }>`
  position: relative;
  width: 100%;
  height: fit-content;
  min-height: 400px;
  display: grid;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform: ${({ $flipped }) => ($flipped ? "rotateY(180deg)" : "rotateY(0deg)")};
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

const FlipCardFace = styled.div<{ $back?: boolean }>`
  position: relative;
  grid-area: 1 / 1;
  min-width: 0;
  width: 100%;
  height: fit-content;
  min-height: 400px;
  backface-visibility: hidden;
  background: ${({ theme }) => (theme.colorBgContainer)};
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: ${({ $back }) => ($back ? "rotateY(180deg)" : "none")};
  overflow-wrap: anywhere;
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
    const checkoutSubmittingRef = useRef(false);
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
    const previousFlippedRef = useRef(flipped);
    const modulesButtonRef = useRef<HTMLButtonElement>(null);
    const returnButtonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (previousFlippedRef.current === flipped) return;
        (flipped ? returnButtonRef : modulesButtonRef).current?.focus({ preventScroll: true });
        previousFlippedRef.current = flipped;
    }, [flipped]);
    const selectedCycleRef = useRef<string>("YEARLY");
    const [selectedCycle, setSelectedCycle] = useState<string>("YEARLY");
    const [allTermsAccepted, setAllTermsAccepted] = useState(false);
    const allTermsAcceptedRef = useRef(false);
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
        form: paymentInfoForm,
    } = useForm<PaymentInfo>();

    const handleFlip = () => setFlipped(!flipped);

    const getAvailableCycles = (planData: NewPlanModel) =>
        getPlanRecurringPrices(planData).map(cycle => ({ ...cycle, price: cycle.amount }));

    const cyclesForSelection = (planData: NewPlanModel, cycle: string) => {
        const cycles = getAvailableCycles(planData);
        return cycles.find(item => item.value === cycle)?.value || cycles[0]?.value || "MONTHLY";
    };

    const resetModal = () => {
        invalidateReferral();
        console.log("resetModal");
        setAllTermsAccepted(false);
        allTermsAcceptedRef.current = false;
        setSelectedCycle("YEARLY");
        selectedCycleRef.current = "YEARLY";
        paymentInfoForm.resetFields();
    };

    const handleSelectPlan = (planData: NewPlanModel) => {
        invalidateReferral();
        const availableCycles = getAvailableCycles(planData);

        // Resetar ciclo se não estiver disponível
        if (availableCycles.length > 0 && !availableCycles.find(c => c.value === selectedCycle)) {
            setSelectedCycle(availableCycles[0].value);
        }

        selectedCycleRef.current = cyclesForSelection(planData, selectedCycle);

        // Componente interno do modal que tem acesso aos availableCycles
        const ModalContent = () => {
            const submitting = useContext(CheckoutSubmittingContext);
            const cycles = getAvailableCycles(planData);

            // Estado local para o ciclo selecionado dentro do modal
            const [localSelectedCycle, setLocalSelectedCycle] = useState(
                cycles.find(c => c.value === selectedCycle) ? selectedCycle : cycles[0]?.value || "YEARLY"
            );

            // Estado local único para os termos
            const [localAllTermsAccepted, setLocalAllTermsAccepted] = useState(allTermsAccepted);

            return (
                <div inert={submitting} aria-busy={submitting} className="plan-checkout-content">
                    <p className="plan-checkout-intro">Confira a assinatura do plano <strong>{planData.name}</strong> e preencha os dados de pagamento.</p>
                    <div className="plan-checkout-cycle">
                        <label htmlFor={`checkout-cycle-${planData.id}`}>Assinatura selecionada</label>
                        {cycles.length > 0 ? (
                            <>
                                <CycleSelector
                                    id={`checkout-cycle-${planData.id}`}
                                    plan={planData}
                                    selectedCycle={localSelectedCycle}
                                    disabled={submitting}
                                    onCycleChange={(value) => {
                                        invalidateReferral();
                                        setLocalSelectedCycle(value);
                                        setSelectedCycle(value);
                                        selectedCycleRef.current = value;
                                    }}
                                />
                                
                            </>
                        ) : (
                            <div className="plan-checkout-unavailable" role="status">
                                Nenhuma assinatura disponível para este plano.
                            </div>
                        )}
                    </div>

                    <ReferralQuote planId={planData.id} cycle={localSelectedCycle} onReadinessChange={handleReferralReadiness} disabled={submitting} />
                    <PaymentInfoThirdStep formV={paymentInfoForm} />

                    <PaymentConsents>
                        <Checkbox
                            disabled={submitting}
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
                            <Link href="/termos-e-politicas" target="_blank" rel="noopener noreferrer">
                                termos e políticas
                            </Link>
                        </Checkbox>
                    </PaymentConsents>
                </div>
            );
        };

        setModalProps({
            title: "Finalize sua assinatura",
            content: <ModalContent />,
            onConfirm: () => subscribePlan(planData, paymentInfoForm, allTermsAcceptedRef.current),
            onCancel: () => {
                if (checkoutSubmittingRef.current) return;
                resetModal();
                setModalProps({ ...modalProps, visible: false });
            },
            confirmText: "Confirmar e assinar",
            cancelText: "Voltar",
            visible: true,
            isDeclined: false,
        });
    };

    async function subscribePlan(planData: NewPlanModel, paymentInfoForm: FormInstance<PaymentInfo>, termsAccepted: boolean) {
        if (checkoutSubmittingRef.current) return;
        const checkoutCycle = selectedCycleRef.current;
        if (!isReferralCheckoutReady(referralReadinessRef.current, planData.id, checkoutCycle)) {
            message.error("Confira o código de desconto ou continue pelo valor regular antes de confirmar.");
            return;
        }
        checkoutSubmittingRef.current = true;
        setIsLoading(true);

        console.log(termsAccepted);
        // Validar termos de aceite
        if (!termsAccepted) {
            message.error("Por favor, aceite os termos e condições");
            setIsLoading(false);
            checkoutSubmittingRef.current = false;
            return;
        }

        try { await paymentInfoForm.validateFields(); } catch {
            message.error("Por favor, preencha os dados de pagamento corretamente");
            setIsLoading(false);
            checkoutSubmittingRef.current = false;
            return;
        }
        if (selectedCycleRef.current !== checkoutCycle || !isReferralCheckoutReady(referralReadinessRef.current, planData.id, checkoutCycle)) {
            message.error("A assinatura selecionada mudou. Confira a oferta antes de confirmar.");
            setIsLoading(false);
            checkoutSubmittingRef.current = false;
            return;
        }
        const paymentData = paymentInfoForm.getFieldsValue() as PaymentInfo;
        if (!paymentData || !paymentData.expiryDate) {
            message.error("Por favor, preencha todos os dados de pagamento");
            setIsLoading(false);
            checkoutSubmittingRef.current = false;
            return;
        }

        const payload = {
            planId: planData.id,
            saveCard: paymentData.saveCard || false,
            billingType: "CREDIT_CARD",
            cycle: checkoutCycle,
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
            const response = await fetch(`/api/affiliate-checkout/existing-user`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Não foi possível concluir a assinatura.");
            }
            message.success("Plano assinado com sucesso");
            resetModal();
            setModalProps({ ...modalProps, visible: false });
            setTimeout(() => window.location.reload(), 200);
        } catch (error) {
            message.error(error instanceof Error ? error.message : "Não foi possível concluir a assinatura.");
        } finally {
            setIsLoading(false);
            checkoutSubmittingRef.current = false;
        }

    }

    return (
        <FlipCardContainer>
            <FlipCardInner $flipped={flipped}>
                <FlipCardFace inert={flipped} aria-hidden={flipped}>
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
                        {getPlanCardPrice(plan) && <Descriptions.Item label="Assinatura">
                            <div>{getPlanCardPrice(plan)?.headline}</div>
                            <Typography.Text type="secondary">{getPlanCardPrice(plan)?.detail}</Typography.Text>
                        </Descriptions.Item>}

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
                                disabled={getAvailableCycles(plan).length === 0}
                                onClick={() => handleSelectPlan(plan)}
                            >
                                {getAvailableCycles(plan).length ? "Assinar Plano" : "Contratação indisponível"}
                            </Button>
                            <Button ref={modulesButtonRef} type="default" size="large" onClick={handleFlip}>Ver Módulos</Button>
                        </div>
                    </ButtonContent>
                </FlipCardFace>
                <FlipCardFace $back inert={!flipped} aria-hidden={!flipped}>
                    <ProfileTitle level={4}>Módulos do Plano</ProfileTitle>
                    {plan.modules && plan.modules.length > 0 ? (
                        <ul>
                            {plan.modules.map((mod) => <li key={mod.id}>{mod.name}</li>)}
                        </ul>
                    ) : <p>Nenhum módulo disponível</p>}

                    <ButtonContent>
                        <Button ref={returnButtonRef} type="default" size="large" onClick={handleFlip}>Voltar</Button>
                    </ButtonContent>
                </FlipCardFace>
            </FlipCardInner>

            <CheckoutSubmittingContext.Provider value={isLoading}>
            <PlanCheckoutModal
                width={680}
                useModalHeader
                title={modalProps.title}
                content={modalProps.content}
                confirmText={modalProps.confirmText}
                cancelText={modalProps.cancelText}
                visible={modalProps.visible}
                onConfirm={modalProps.onConfirm}
                onCancel={modalProps.onCancel}
                isDeclined={modalProps.isDeclined}
                confirmDisabled={isLoading || !isReferralCheckoutReady(referralReadiness, plan.id, selectedCycleRef.current)}
                destroyOnClose
                closable={!isLoading}
                maskClosable={!isLoading}
                keyboard={!isLoading}
            />
            </CheckoutSubmittingContext.Provider>
            <AppLoading
                loadingModal
                show={isLoading}
            />
        </FlipCardContainer >
    );
};
