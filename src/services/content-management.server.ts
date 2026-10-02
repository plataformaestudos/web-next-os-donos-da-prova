import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { FullQuestion } from "@/model/question.model";
import { PlanFormValues } from "@/plans/upsert/upsert-plan-form.component";

export type ManagedPlanSummary = { id: string; name: string; status: string | null };
export type ManagedQuestion = FullQuestion & { comment: string };

export async function loadManagedPlans() {
  const result = await HttpClient.fetch<ResponseModel<ManagedPlanSummary[]>>("/management/plans", { cache: "no-store" });
  return result.data;
}

export async function loadManagedPlan(id: string) {
  const result = await HttpClient.fetch<ResponseModel<PlanFormValues>>(`/management/plans/${encodeURIComponent(id)}`, { cache: "no-store" });
  return result.data;
}

export async function loadManagedQuestion(id: string) {
  const result = await HttpClient.fetch<ResponseModel<ManagedQuestion>>(`/management/questions/${encodeURIComponent(id)}`, { cache: "no-store" });
  return result.data;
}
