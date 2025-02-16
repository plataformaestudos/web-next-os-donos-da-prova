import Link from "next/link";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/home");
  }

  return (
    <main>
      <h1>Landing</h1>
      <Link href="/login">Login</Link>
    </main>
  );
}
