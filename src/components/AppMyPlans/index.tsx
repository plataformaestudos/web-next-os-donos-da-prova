"use client";

import { App, Flex } from "antd";
import { AppPlan } from "../AppPlan";
import { useEffect, useState } from "react";
import { ResponseModel } from "@/model/common.model";
import HttpClient from "@/util/http-client/fetch-client.util";
import { PlanModel } from "@/model/plan.model";

export const AppMyPlans = () => {
    const [plans, setPlans] = useState<PlanModel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { message } = App.useApp();

    useEffect(() => {
        async function getPayments() {
            setIsLoading(true);
            try {
                const response = await HttpClient.fetch<ResponseModel<PlanModel[]>>(
                    `/user-subscriptions/actives`,
                    {
                        method: "GET",
                    },
                    false
                );

                if (response.data) {
                    setPlans(response.data);
                } else {
                    throw new Error(response.message || "Erro ao buscar os planos");
                }
            }  finally {
                setIsLoading(false);
            }
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
                <p>Você não possui planos ativos no momento.</p>
            )}
            {plans.map((plan) => (
                <AppPlan
                    myPlan
                    key={plan?.id}
                    plan={plan}
                />
            ))}
        </Flex>
    );
};
