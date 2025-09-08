"use client";

import { App, Flex } from "antd";
import { AppPlan } from "../AppPlan";
import { useEffect, useState } from "react";
import { ResponseModel } from "@/model/common.model";
import HttpClient from "@/util/http-client/fetch-client.util";
import { PlanModel } from "@/model/plan.model";

export const AppNewPlans = () => {
  const [plans, setPlans] = useState<PlanModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { message } = App.useApp();

  useEffect(() => {
    async function getPayments() {
      setIsLoading(true);
      return HttpClient.fetch<ResponseModel<PlanModel[]>>(
         "/subscription-plans/availables",
        {
          method: "GET",
        }
      )
        .then((response) => {
          if (response.data) {
            setPlans(response.data);
          } else {
            message.error(response.message || "Erro ao buscar os planos");
          }
        })
        .catch(() => null)
        .finally(() => setIsLoading(false));
    }

    getPayments();
  }, [message]);
  return (
    <Flex
      wrap="wrap"
      justify="start"
      style={{
        width: "100%",
        gap: "20px",
        padding: "32px",
        height: "fit-content",
      }}
    >
      {plans?.length === 0 && !isLoading && (
        <p>Não temos novos planos disponíveis no momento.</p>
      )}
      {plans.map((plan) => (
        <AppPlan
          myPlan={false}
          key={plan?.id}
          plan={plan}
        />
      ))}
    </Flex>
  );
};
