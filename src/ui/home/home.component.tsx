"use client";

import { PostgrestSingleResponse } from "@supabase/supabase-js";
import * as S from "./home.style";

import { AppLoading } from "@/components/AppLoading";
import { ResponseModel } from "@/model/common.model";
import HttpClient from "@/util/http-client/fetch-client.util";
import { Progress } from "antd";
import { useEffect, useState } from "react";
import Image from "next/image";

interface DashboardData {
  loginsInCurrentMonth: string[];
  totalAnswers: number;
  totalBooksFavorited: number;
  statsLastBookAnswered: {
    percentAnswered: string;
    nameBook: string;
  };
}

interface HomeContentProps {
  userProfile: PostgrestSingleResponse<{
    name?: string;
  }>;
}

export function HomeContent({ userProfile }: HomeContentProps) {
  const [dashData, setDashData] = useState<DashboardData>({
    loginsInCurrentMonth: [],
    totalAnswers: 0,
    totalBooksFavorited: 0,
    statsLastBookAnswered: {
      percentAnswered: "0%",
      nameBook: "Nenhum caderno respondido",
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getData() {
      setIsLoading(true);
      return HttpClient.fetch<ResponseModel<DashboardData>>(`/dashboard`, {
        method: "GET",
      })
        .then((response) => response.data)
        .catch(() => null)
        .finally(() => setIsLoading(false));
    }

    getData()
      .then((response) => setDashData(response ? response : dashData))
      .catch(() => {});
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

  const activeCount = activeDaysSet.size;

  return (
    <div>
      <S.Title>Olá, {userProfile.data?.name}</S.Title>
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
                window.location.href = "/question-books";
              }}
            >
              <S.CardTitle>Continue de onde parou</S.CardTitle>
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
            <S.Card>
              <S.CardTitle
                onClick={() => {
                  window.location.href = "/question-books";
                }}
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
            <S.Card>
              <S.CardTitle>Cadernos</S.CardTitle>
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
                    return (
                      <S.DayDot
                        key={day}
                        title={`Dia ${day} - ${isActive ? "ativo" : "inativo"}`}
                        $active={isActive}
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
