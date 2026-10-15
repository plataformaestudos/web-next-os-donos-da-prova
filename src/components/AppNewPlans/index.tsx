"use client";

import { App, Flex } from "antd";
import { AppPlanCardNewPlan } from "../AppPlanCardNewPlan";
import { useEffect, useState } from "react";
import { ResponseModel } from "@/model/common.model";
import HttpClient from "@/util/http-client/fetch-client.util";
import { NewPlanModel } from "@/model/plan.model";
import { ReferralPlanCode, ReferralPlansProvider } from "@/affiliates/referral-plans.component";

export const AppNewPlans = () => {
  const [plans, setPlans] = useState<NewPlanModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  console.log(plans);
  const { message } = App.useApp();

  useEffect(() => {
 async function getAvailablePlans() {
      setIsLoading(true);
      try {
        const response = await HttpClient.fetch<ResponseModel<NewPlanModel[]>>(
          "/subscription-plans/availables",
          {
            method: "GET",
          },
            false
        );

        if (response.data) {
          setPlans(response.data);
        } else {
          throw new Error(response.message || "Erro ao buscar os planos disponíveis");
        }
      } finally {
        setIsLoading(false);
      }
    }

    getAvailablePlans();
  }, [message]);
  return (
    <ReferralPlansProvider>
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "24px 20px 0" }}><ReferralPlanCode /></div>
    <Flex
      wrap="wrap"
      justify="center"
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
        <AppPlanCardNewPlan
          key={plan?.id}
          plan={plan}
        />
      ))}
    </Flex>
    </ReferralPlansProvider>
  );
};
