"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/user.context";
import { canAccess } from "@/util/roles";
import { Roles } from "@/util/roles";

type Options = {
  redirectTo?: string;
  redirectOnForbidden?: string;
  requireRoles?: Roles[];
};

export function useAuthGuard(options: Options = {}) {
  const { redirectTo = "/login", redirectOnForbidden = "/", requireRoles } = options;
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // espera inicialização
    if (!user) {
      router.push(redirectTo);
      return;
    }
    if (requireRoles && !canAccess(user, requireRoles)) {
      router.push(redirectOnForbidden);
    }
  }, [loading, user, router, redirectTo, redirectOnForbidden, requireRoles]);

  // retorna também um flag allowed pra render condicional
  const allowed = !loading && Boolean(user) && (!requireRoles || canAccess(user, requireRoles));
  return { user, loading, allowed };
}
