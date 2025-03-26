"use server";

import HttpClient from "@/util/http-client/fetch-server.util";
import { SignupDTO } from "./signup.dto";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signup(dto: SignupDTO): Promise<{
  success: boolean | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const response = await HttpClient.fetch<{
    success: boolean;
    statusCode: number;
    message: string;
  }>("/subscription/new-user", {
    method: "POST",
    body: JSON.stringify(dto),
  });

  if (response.success) {
    await supabase.auth.signInWithPassword({
      email: dto.userInfo.email,
      password: dto.userInfo.password,
    });

    revalidatePath("/", "layout");
    redirect("/");
  } else if (response.statusCode === 500) {
    return { success: false, error: response.message as string };
  }

  return { success: false, error: null };
}
