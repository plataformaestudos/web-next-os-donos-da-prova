import { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser())?.data?.user;
  return user;
}
