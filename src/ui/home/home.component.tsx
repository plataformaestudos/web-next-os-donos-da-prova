"use client";

import * as S from "./home.style";

import { AppLoading } from "@/components/AppLoading";
import { ResponseModel } from "@/model/common.model";
import HttpClient from "@/util/http-client/fetch-client.util";
import { Progress } from "antd";
import { useEffect, useState } from "react";
import Image from "next/image";

export interface UserAnswersCurrentMonthDto {
    answeredAt: Date;
    count: number;
}

interface DashboardData {
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
    };
}

export function HomeContent({ userProfile }: HomeContentProps) {
    const [dashData, setDashData] = useState<DashboardData>({
        loginsInCurrentMonth: [],
        totalAnswers: 0,
        totalBooksFavorited: 0,
        answersByDayInCurrentMonth: [],
        statsLastBookAnswered: {
            percentAnswered: "0%",
            nameBook: "Nenhum caderno respondido",
            idBook: "",
        },
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function getData() {
            setIsLoading(true);
            try {
                const response = await HttpClient.fetch<ResponseModel<DashboardData>>(
                    `/dashboard`,
                    { method: "GET" },
                    false
                );
                return response.data;
            } finally {
                setIsLoading(false);
            }
        }

        getData()
            .then((response) =>
                setDashData((prev) => (response ? response : prev))
            )
            .catch(() => { });
    }, []);

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
            <S.Title>Olá, {userProfile.name}</S.Title>
            {isLoading ? (
                <AppLoading
                    show={isLoading}
                    loadingText="Carregando dashboard..."
                />
            ) : (
                <S.Container>
                    <S.Content>
                        <S.Card
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
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    marginTop: "-6px",
                                }}
                            />
                        </S.Card>
                        <S.Card onClick={() => {
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
                        <S.Card onClick={() => {
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
                        <S.Card>
                            <S.CardTitle>
                                Concursos{" "}
                                <Image
                                    src="/images/concursos.png"
                                    alt="Concursos"
                                    width={30}
                                    height={30}
                                />{" "}
                            </S.CardTitle>
                        </S.Card>
                    </S.Content>
                    <S.RightContent>
                        <S.CardPerformance $large>
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
                    </S.RightContent>
                </S.Container>
            )}
        </div>
    );
}
