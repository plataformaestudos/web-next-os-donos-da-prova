"use client";

import {
  PropsWithChildren,
  createContext,
  useActionState,
  useContext,
} from "react";

import { updateModule } from "./update-module.action";

const UpdateModuleContext = createContext(
  {} as {
    updateModule: (payload: { id: string; name: string }) => void;
    isPending: boolean;
    error: string | null;
  }
);

export const UpdateModuleProvider = ({ children }: PropsWithChildren) => {
  const [{ error }, formAction, isPending] = useActionState(updateModule, {
    error: null,
  });

  return (
    <UpdateModuleContext.Provider
      value={{ updateModule: formAction, isPending, error }}
    >
      {children}
    </UpdateModuleContext.Provider>
  );
};

export function useUpdateModule() {
  return useContext(UpdateModuleContext);
}
