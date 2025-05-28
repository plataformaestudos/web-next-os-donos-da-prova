
"use server";

import { cookies } from "next/headers";

// set cookie
export async function setCookie(name: string, value: string, options?: { expires?: Date; path?: string }) {
  const cookieStore = await cookies();
  cookieStore.set({
    name,
    value,
    ...options,
  });
}

// get cookie
export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}