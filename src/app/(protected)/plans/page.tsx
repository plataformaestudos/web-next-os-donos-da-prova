// PlansPage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { PlansPageClient } from "./pageClient";

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase.from("subscription_plans").select("*");

  return <PlansPageClient plans={plans || []} />;
}
