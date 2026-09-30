import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next");
  // Invitations must end at password setup; other callbacks stay on this site.
  const next = type === "invite" ? "/accept-invitation" :
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//") && !requestedNext.includes("\\") ? requestedNext : "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(type === "invite" ? "/accept-invitation?error_description=invalid_invite" : "/error");
}
