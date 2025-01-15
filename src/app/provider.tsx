"use client";

import { PropsWithChildren } from "react";
import { RouterProvider } from "react-aria-components";
import { useRouter } from "next/navigation";

declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function ClientProviders({ children }: PropsWithChildren) {
  let router = useRouter();

  return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
}
