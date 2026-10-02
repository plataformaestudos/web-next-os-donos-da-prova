// PlansPage.tsx (Server Component)
import { loadManagedPlans } from "@/services/content-management.server";
import { PlansPageClient } from "./pageClient";

export default async function PlansPage() {
  const plans = await loadManagedPlans();

  return <PlansPageClient plans={plans || []} />;
}
