// EditPlanPage.tsx (Server Component)
import { loadManagedPlan, loadUpgradePlanOptions } from "@/services/content-management.server";
import { EditPlanPageClient } from "./pageClient";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [plan, upgradeOptions] = await Promise.all([loadManagedPlan(id), loadUpgradePlanOptions()]);

  if (!plan) return null;

  return <EditPlanPageClient plan={plan} upgradeOptions={upgradeOptions}/>;
}
