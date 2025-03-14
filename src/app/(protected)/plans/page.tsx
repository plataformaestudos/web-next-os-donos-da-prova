import * as Styled from "./page.style";

import { Button, Flex, List } from "antd";
import Item, { Meta } from "antd/es/list/Item";

import { DeletePlanButton } from "@/plans/delete/delete-plan-button.component";
import { FaPencil } from "react-icons/fa6";
import Link from "next/link";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { createClient } from "@/util/supabase/server";

export default async function PlansPage() {
  const supabase = await createClient();

  const { data: plans } = await supabase.from("subscription_plans").select("*");

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
          {plans?.map((plan) => (
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
                }).format(plan.price)}
              </div>
            </Item>
          ))}
        </List>
      </Styled.ListContainer>
    </PageLayout>
  );
}
