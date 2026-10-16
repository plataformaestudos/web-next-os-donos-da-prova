"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { UpsertPlanDTO } from "./upsert-plan.dto";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { redirect } from "next/navigation";

export async function upsertPlan(
  _: {
    error: string | null;
  },
  { id, name, description, isFree, durationDays, lifetimeValue, monthValue, quarterlyValue, questionLimit, semiannualValue, annualValue, cardDisplayCycle, cardDisplayMode, upgradePlanId, upgradeCycle, modules }: UpsertPlanDTO
): Promise<{ error: string | null }> {
  if (!name) {
    return {
      error: "Nome é obrigatório",
    };
  }

  let planId: string;
  try {
    const result = await HttpClient.fetch<ResponseModel<{ id: string }>>(
      id ? `/management/plans/${encodeURIComponent(id)}` : "/management/plans", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({ name, description, isFree, durationDays, lifetimeValue,
        monthValue, quarterlyValue, questionLimit, semiannualValue, annualValue,
        cardDisplayCycle: isFree ? null : cardDisplayCycle, cardDisplayMode,
        upgradePlanId: isFree ? upgradePlanId ?? null : null,
        upgradeCycle: isFree && upgradePlanId ? upgradeCycle ?? null : null, modules }),
      });
    planId = result.data.id;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível salvar o plano." };
  }
  revalidateTag(CACHE_TAGS.PLANS);
  revalidatePath("/plans");
  revalidatePath(`/plans/${planId}`);
  redirect("/plans");
}
