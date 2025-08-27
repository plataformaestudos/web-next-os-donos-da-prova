"use client";

import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { IoTrophySharp } from "react-icons/io5";
import { LuNotebookText } from "react-icons/lu";
import * as S from "./home.style";

import { Progress } from "antd";
import { useEffect, useState } from "react";
import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";
import { AppLoading } from "@/components/AppLoading";

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

  return (
    <div>
      <S.Title>Olá, {userProfile.data?.name}</S.Title>
      {isLoading ? (
        <AppLoading show={isLoading} loadingText="Carregando dashboard..." />
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
                {dashData?.statsLastBookAnswered.nameBook}
              </S.CardTitle>
              <Progress
                type="line"
                percent={parseFloat(
                  dashData?.statsLastBookAnswered.percentAnswered.replace(
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
                <LuNotebookText size={25} />{" "}
              </S.Flex>
            </S.Card>
            <S.Card>
              <S.CardTitle>
                Concursos <IoTrophySharp size={20} />{" "}
              </S.CardTitle>
            </S.Card>
            {/* <S.Card>
              <S.CardTitle>Visão Geral</S.CardTitle>
            </S.Card> */}
          </S.Content>
        </S.Container>
      )}
    </div>
  );
}
