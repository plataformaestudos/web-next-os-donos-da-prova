"use client";

import { CreateModuleProvider } from "@/modules/create/create-module.context";

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CreateModuleProvider>{children}</CreateModuleProvider>;
}
