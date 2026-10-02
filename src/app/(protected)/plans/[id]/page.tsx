// EditPlanPage.tsx (Server Component)
import { loadManagedPlan } from "@/services/content-management.server";
import { EditPlanPageClient } from "./pageClient";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await loadManagedPlan(id);

  if (!plan) return null;

  return <EditPlanPageClient plan={plan}/>;
}
