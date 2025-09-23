"use client";

import HttpClient from "@/util/http-client/fetch-client.util";
import * as S from "./styles";

import { List, Empty, Pagination } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import Item, { Meta } from "antd/es/list/Item";
import { useEffect, useState } from "react";
import { AppLoading } from "../AppLoading";
import { formatDate } from "@/util/date";
import { ResponseModel } from "@/model/common.model";

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
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchPayments = async (pageNumber: number = 1) => {
        setIsLoading(true);
        try {
            const response = await HttpClient.fetch<ResponseModel<Payment[]>>(
                `/payments?page=${pageNumber}&itemsPerPage=${itemsPerPage}`,
                { method: "GET" },
                false
            );

            if (response) {
                setPayments(response.data || []);
                setPage(response.page || 1);
                setItemsPerPage(response.itemsPerPage || 10);
                setTotalPages(response.total && response.itemsPerPage ? Math.ceil(response.total / response.itemsPerPage) : 1);
            } else {
                setPayments([]);
                throw new Error("Erro ao buscar os pagamentos");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments(page);
    }, [page]);

    return (
        <S.ListContainer>
            {payments.length === 0 && !isLoading ? (
                <Empty description="Nenhum pagamento encontrado" />
            ) : (
                <>
                    <List
                        dataSource={payments}
                        renderItem={(payment) => (
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
                                    title={`Pagamento ${
                                        payment.status === "paid" ? "Efetuado" : "Pendente"
                                    }`}
                                    description={formatDate(payment.paymentDate)}
                                />
                                <div>
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(Number(payment?.value ?? 0))}
                                </div>
                            </Item>
                        )}
                    />

                    <Pagination
                        current={page}
                        pageSize={itemsPerPage}
                        total={totalPages * itemsPerPage}
                        onChange={(p) => setPage(p)}
                        align="center"
                        style={{ marginTop: 16, textAlign: "center"  }}
                    />
                </>
            )}

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
