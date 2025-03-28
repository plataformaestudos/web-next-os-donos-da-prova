import { RoleBasedPagesCards } from "./role-based-pages-cards.component";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const userProfile = await supabase
    .from("profiles")
    .select("*")
    .match({ user_id: data.user.id })
    .single();

  return (
    <main style={{ padding: 24 }}>
      <p>Seja bem vindo {userProfile.data?.name}!</p>
      <RoleBasedPagesCards />
    </main>
  );
}
