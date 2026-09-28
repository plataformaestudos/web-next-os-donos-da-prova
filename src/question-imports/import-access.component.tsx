"use client";

import { Fragment, type PropsWithChildren } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";

const importRoles = [Roles.ADMIN, Roles.COLLABORATOR];

export function ImportAccess({ children }: PropsWithChildren) {
  const { user, loading, allowed } = useAuthGuard({
    requireRoles: importRoles,
  });
  if (loading) return <FullPageLoading />;
  return allowed ? <Fragment key={user?.id}>{children}</Fragment> : null;
}
