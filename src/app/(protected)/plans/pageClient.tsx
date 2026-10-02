"use client";

import * as Styled from "./page.style";
import { Button, Flex, List, Tag } from "antd";
import Item, { Meta } from "antd/es/list/Item";
import { FaPencil } from "react-icons/fa6";
import Link from "next/link";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { TogglePlanStatusButton } from "@/plans/toggle-status/toggle-plan-status-button.component";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import type { ManagedPlanSummary } from "@/services/content-management.server";

export function PlansPageClient({ plans }: { plans: ManagedPlanSummary[] }) {
  const { loading, allowed } = useAuthGuard({ requireRoles: [Roles.ADMIN] });

  if (loading) return <FullPageLoading />;

  if (!allowed) return null; 
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
                <TogglePlanStatusButton key="toggle" planId={plan.id} currentStatus={plan.status || 'INACTIVE'} />,
              ]}
            >
              <Meta title={plan.name} description={plan.id} />
              <Tag 
                color={plan.status === 'ACTIVE' ? 'green' : 'red'}
                style={{ 
                  fontWeight: 600,
                  borderRadius: '12px',
                  padding: '2px 10px',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}
              >
                {plan.status === 'ACTIVE' ? '✓ Ativo' : '✗ Inativo'}
              </Tag>
            </Item>
          ))}
        </List>
      </Styled.ListContainer>
    </PageLayout>
  );
}
