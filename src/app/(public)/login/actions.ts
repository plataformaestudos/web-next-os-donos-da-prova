"use server";

import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LoginService } from "@/@domain/services/login.service";
import { LoginModel } from "@/model/login.model";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const loginModel = {
    username: formData.get("email") as string,
    password: formData.get("password") as string,
  } as LoginModel;

  const loginService = new LoginService(loginModel);

  await loginService.login();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: _data } = await supabase.auth.signInWithPassword(data);

  console.log(_data);

  if (error) {
    console.log(error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  // redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.log(error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  // redirect("/");
}
