"use client";

import { Button } from "antd";
import { UPSERT_PLAN_FORM_ID } from "./upsert-plan-form.constant";
import { useUpsertPlan } from "./upsert-plan.context";

export function UpsertPlanFormSubmitButton() {
  const { isPending } = useUpsertPlan();

  return (
    <Button
      type="primary"
      size="large"
      form={UPSERT_PLAN_FORM_ID}
      htmlType="submit"
      disabled={isPending}
      loading={isPending}
    >
      Salvar
    </Button>
  );
}
