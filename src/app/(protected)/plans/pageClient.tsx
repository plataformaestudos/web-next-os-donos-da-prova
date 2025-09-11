"use client";

import * as Styled from "./page.style";
import { Button, Flex, List } from "antd";
import Item, { Meta } from "antd/es/list/Item";
import { FaPencil } from "react-icons/fa6";
import Link from "next/link";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { DeletePlanButton } from "@/plans/delete/delete-plan-button.component";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
type SubscriptionPlan = {
  id: string;
  name: string;
  month_value: number;
  quarterly_value: number;
  semiannual_value: number;
  annual_value: number;
  unique_value: number;
  allow_lifetime: boolean;
  created_at: string; 
  created_by: string;
  updated_at: string;
  updated_by: string;
  status: string | null; 
  lifetime_value: number | null;
  description: string | null;
  is_free: boolean;
  question_limit: number | null;
  duration_days: number | null;
};

export function PlansPageClient({ plans }: { plans: SubscriptionPlan[] }) {
  const { loading, allowed } = useAuthGuard({ requireRoles: [Roles.ADMIN] });

  if (loading) return <FullPageLoading />;

  if (!allowed) return null; // usuário sem permissão

  return (
    <PageLayout
      title="Planos"
      actions={[
        <Link key="create" href="/plans/new">
          <Button type="primary" size="large">
            Criar plano
          </Button>
        </Link>,
      ]}
    >
      <Styled.ListContainer>
        <List>
          {plans.map((plan) => (
            <Item
              key={plan.id}
              actions={[
                <Button type="link" key="edit">
                  <Link href={`/plans/${plan.id}`}>
                    <Flex gap={8} align="center">
                      <FaPencil />
                      <span>Editar</span>
                    </Flex>
                  </Link>
                </Button>,
                <DeletePlanButton key="delete" planId={plan.id} />,
              ]}
            >
              <Meta title={plan.name} description={plan.id} />
              <div>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(plan.month_value)}
              </div>
            </Item>
          ))}
        </List>
      </Styled.ListContainer>
    </PageLayout>
  );
}
