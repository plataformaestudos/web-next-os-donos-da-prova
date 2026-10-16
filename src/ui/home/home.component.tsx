"use client";

import * as S from "./home.style";

import { AppLoading } from "@/components/AppLoading";
import { WhatsAppFloatButton } from "@/components/WhatsAppFloatButton";
import { ResponseModel } from "@/model/common.model";
import HttpClient from "@/util/http-client/fetch-client.util";
import { Progress } from "antd";
import { useEffect } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/app/context/user.context";
import { hasStaffAccess } from "@/util/roles";
import { FreePlanUsageCard } from "./free-plan-usage.component";
import { FreePlanUsage, hasFreePlanIndicators, nextUsageRefreshDelay } from "./free-plan-usage.model";
import { useStudyAccess } from "@/free-plan-upgrade/study-access-provider.component";

export interface UserAnswersCurrentMonthDto {
    answeredAt: Date;
    count: number;
}

interface DashboardData {
    freePlanUsage?: FreePlanUsage | null;
    loginsInCurrentMonth: string[];
    totalAnswers: number;
    totalBooksFavorited: number;
    answersByDayInCurrentMonth: UserAnswersCurrentMonthDto[];
    statsLastBookAnswered: {
        percentAnswered: string;
        nameBook: string;
        idBook: string;
    } | null;
}

interface HomeContentProps {
    userProfile: {
        name?: string;
        nickname?: string | null;
    };
}

export function HomeContent({ userProfile }: HomeContentProps) {
    const { user } = useUser();
    const { access } = useStudyAccess();
    const dashboard = useQuery({
        queryKey: ["dashboard", user?.id, user?.profile?.role_id],
        enabled: Boolean(user?.profile),
        queryFn: async ({ signal }) => {
            const response = await HttpClient.fetch<ResponseModel<DashboardData>>(
                "/dashboard",
                { method: "GET", cache: "no-store", signal },
                false
            );
            return response.data;
        },
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: "always",
        retry: 1,
    });
    const dashData: DashboardData = dashboard.data ?? {
        loginsInCurrentMonth: [],
        totalAnswers: 0,
        totalBooksFavorited: 0,
        answersByDayInCurrentMonth: [],
        statsLastBookAnswered: {
            percentAnswered: "0%",
            nameBook: "Nenhum caderno respondido",
            idBook: "",
        },
    };
    const isLoading = dashboard.isLoading;
    const freePlanUsage = !hasStaffAccess(user) && !dashboard.isError ? dashData.freePlanUsage : null;
    const freeTrialExpired = !hasStaffAccess(user) && access?.reason === "FREE_TRIAL_EXPIRED";
    const showFreePlanCard = freeTrialExpired || hasFreePlanIndicators(freePlanUsage);
    const { refetch } = dashboard;

    useEffect(() => {
        const refresh = () => { void refetch(); };
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) refresh();
        };
        window.addEventListener("focus", refresh);
        window.addEventListener("pageshow", handlePageShow);
        return () => {
            window.removeEventListener("focus", refresh);
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, [refetch]);

    useEffect(() => {
        const delay = nextUsageRefreshDelay(freePlanUsage);
        if (delay === null) return;
        const timer = window.setTimeout(() => { void refetch(); }, delay);
        return () => window.clearTimeout(timer);
    }, [freePlanUsage, refetch, dashboard.dataUpdatedAt]);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const activeDaysSet = new Set<number>();
    (dashData.loginsInCurrentMonth || []).forEach((entry) => {
        if (!entry) return;
        const asNumber = parseInt(entry, 10);
        if (!Number.isNaN(asNumber) && asNumber >= 1 && asNumber <= daysInMonth) {
            activeDaysSet.add(asNumber);
            return;
        }

        const parsed = new Date(entry);
        if (!Number.isNaN(parsed.getTime())) {
            if (
                parsed.getFullYear() === currentYear &&
                parsed.getMonth() === currentMonth
            ) {
                activeDaysSet.add(parsed.getDate());
            }
        }
    });

    const answersByDayMap = new Map<number, number>();
    (dashData.answersByDayInCurrentMonth || []).forEach((answer) => {
        const answerDate = new Date(answer.answeredAt);
        const day = answerDate.getDate();
        answersByDayMap.set(day, answer.count);
    });

    const activeCount = activeDaysSet.size;

    return (
        <div>
            <S.Title>Olá, {userProfile.nickname ?? userProfile.name}</S.Title>
            {isLoading ? (
                <AppLoading
                    show={isLoading}
                    loadingText="Carregando dashboard..."
                />
            ) : (
                <S.Container>
                    <S.Content $hasFreePlanUsage={showFreePlanCard}>
                        <FreePlanUsageCard usage={freePlanUsage} expired={freeTrialExpired} />
                        <S.Card
                            style={{ gridArea: "card1" }}
                            onClick={() => {
                                if (dashData?.statsLastBookAnswered) {
                                    window.location.href = `/question-books/${dashData.statsLastBookAnswered.idBook}`;
                                } else {
                                    window.location.href = `/question-books`;
                                }
                            }}
                        >
                            <S.CardTitle> {dashData?.statsLastBookAnswered
                                ? "Continue de onde parou"
                                : "Iniciar novo caderno"}</S.CardTitle>
                            <S.Spacer />
                            <S.CardTitle>
                                {dashData?.statsLastBookAnswered?.nameBook}
                            </S.CardTitle>
                            <Progress
                                type="line"
                                percent={parseFloat(
                                    dashData?.statsLastBookAnswered?.percentAnswered.replace(
                                        "%",
                                        ""
                                    ) ?? "0"
                                )}
                                strokeColor={{ from: "#af2615", to: "#af2615" }}
                                size={{ height: 10 }}
                                style={{
                                    fontSize: "clamp(12px, 2.5vw, 16px)",
                                    fontWeight: "bold",
                                    marginTop: "clamp(0px, 1vw, 6px)",
                                }}
                            />
                        </S.Card>
                        <S.Card style={{ gridArea: "card2" }} onClick={() => {
                                    window.location.href = "/question-books";
                                }}>
                            <S.CardTitle
                                
                            >
                                Questões
                            </S.CardTitle>
                            <S.Spacer />
                            <S.Button>Praticar agora</S.Button>
                            <S.Info>
                                {dashData?.totalAnswers !== 1
                                    ? `${dashData.totalAnswers} questões respondidas`
                                    : "1 questão respondida"}{" "}
                            </S.Info>
                        </S.Card>
                        <S.Card style={{ gridArea: "card3" }} onClick={() => {
                                    window.location.href = "/question-books";
                                }}>
                            <S.CardTitle  >Cadernos</S.CardTitle>
                            <S.Spacer />
                            <S.Flex>
                                <S.Info
                                    $tertiary
                                    style={{ maxWidth: 100, textAlign: "center" }}
                                >
                                    {dashData?.totalBooksFavorited !== 1
                                        ? `${dashData.totalBooksFavorited} cadernos favoritos`
                                        : "1 caderno favorito"}{" "}
                                </S.Info>
                                <Image
                                    src="/images/cadernos-favoritos.png"
                                    alt="Cadernos Favoritos"
                                    width={40}
                                    height={40}
                                    style={{ height: "auto" }}
                                />
                            </S.Flex>
                        </S.Card>
                        <S.Card style={{ gridArea: "card4" }}>
                            <S.CardTitle>
                                Concursos{" "}
                                <Image
                                    src="/images/concursos.png"
                                    alt="Concursos"
                                    width={30}
                                    height={30}
                                />{" "}
                            </S.CardTitle>
                                <S.CardText style={{ fontSize: 13, color: "#999", textAlign: "center" }}>Em breve..</S.CardText>
                        </S.Card>
                        <S.CardPerformance $large $hasFreePlanUsage={showFreePlanCard}>
                            <S.CardTitle>Meu Desempenho</S.CardTitle>
                            <S.Spacer />

                            <S.Performance>
                                <S.PerformanceHeader>
                                    <S.CardText>Visão do mês atual</S.CardText>
                                    <S.CardText style={{ fontWeight: 700 }}>
                                        {activeCount} dias ativos
                                    </S.CardText>
                                </S.PerformanceHeader>

                                <S.DaysGrid aria-label="Dias do mês">
                                    {daysArray.map((day) => {
                                        const isActive = activeDaysSet.has(day);
                                        const questionsCount = answersByDayMap.get(day) || 0;
                                        const tooltipText = questionsCount > 0 
                                            ? `${questionsCount} ${questionsCount !== 1 ? 'questões' : 'questão'} respondida${questionsCount !== 1 ? 's' : ''}`
                                            : "";
                                        
                                        return (
                                            <S.DayDot
                                                key={day}
                                                data-tooltip={tooltipText}
                                                $active={isActive}
                                                $currentDay={day === today.getDate()}
                                            >
                                                {day}
                                            </S.DayDot>
                                        );
                                    })}
                                </S.DaysGrid>
                            </S.Performance>
                            <Image
                                src="/images/mascote-celular.png"
                                alt="Coruja"
                                style={{
                                    position: "absolute",
                                    top: "-182px",
                                    left: "55%",
                                    transform: "translateX(-50%)",
                                    height: "auto",
                                }}
                                width={200}
                                height={100}
                            />
                        </S.CardPerformance>
                    </S.Content>
                    <S.RightContent>
                        {/* Desktop only  */}
                    </S.RightContent>
                </S.Container>
            )}
            <WhatsAppFloatButton />
        </div>
    );
}
