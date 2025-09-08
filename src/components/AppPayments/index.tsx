"use client";

import HttpClient from "@/util/http-client/fetch-client.util";
import * as S from "./styles";

import { App, List } from "antd";
// icone de comprovante
import { FileTextOutlined } from "@ant-design/icons";
import Item, { Meta } from "antd/es/list/Item";
import { useEffect, useState } from "react";
import { AppLoading } from "../AppLoading";
import { formatDate } from "@/util/date";

interface Payment {
  id: string;
  subscriptionId: string;
  paymentDate: string;
  creditCardNumber: string;
  status: string;
  dueDate: string;
  invoiceUrl: string;
  invoiceNumber: string;
  externalId: string;
  createdAt: string;
  updatedAt: string;
  subscription: {
    id: string;
    userId: string;
    billingRecurrent: boolean;
    billingRecurrencyType: string;
    billingDay: number;
    billingValue: string;
    status: string;
    endDate: string | null;
    createdAt: string;
    createdBy: string;
    updatedAt: string | null;
    updatedBy: string | null;
    paymentMethodSubscriptionId: string;
    subscriptionPlanId: string;
  };
  subscriptionRelationId: string;
  value: string;
}

export function AppPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { message } = App.useApp();

  useEffect(() => {
    async function getPayments() {
      setIsLoading(true);
      return HttpClient.fetch<Payment[]>(`/payments`, {
        method: "GET",
      })
        .then((response) => {
          if (response) {
            setPayments(response);
          } else {
            message.error("Erro ao buscar os pagamentos");
          }
        })
        .catch(() => null)
        .finally(() => setIsLoading(false));
    }

    getPayments();
  }, [message]);

  return (
    <S.ListContainer>
      <List>
        {payments?.map((payment) => (
          <Item
            key={payment.id}
            actions={[
              <a
                href={payment.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                key="view-invoice"
              >
                <FileTextOutlined style={{ marginLeft: 4 }} />
              </a>,
            ]}
          >
            <Meta
              title="Pagamento Efetuado"
              description={formatDate(payment.paymentDate)}
            />
            <div>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(payment?.value ?? 0))}
            </div>
          </Item>
        ))}
      </List>
      {isLoading && (
        <AppLoading
          loadingText="Carregando pagamentos..."
          show={isLoading}
          loadingModal
        />
      )}
    </S.ListContainer>
  );
}
