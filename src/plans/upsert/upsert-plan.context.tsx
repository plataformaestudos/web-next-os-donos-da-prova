"use client";

import {
  PropsWithChildren,
  createContext,
  useActionState,
  useContext,
} from "react";

import { UpsertPlanDTO } from "./upsert-plan.dto";
import { upsertPlan } from "./upsert-plan.action";

const UpsertPlanContext = createContext(
  {} as {
    upsertPlan: (payload: UpsertPlanDTO) => void;
    isPending: boolean;
    error: string | null;
  }
);

export const UpsertPlanProvider = ({ children }: PropsWithChildren) => {
  const [{ error }, formAction, isPending] = useActionState(upsertPlan, {
    error: null,
  });

  return (
    <UpsertPlanContext.Provider
      value={{ upsertPlan: formAction, isPending, error }}
    >
      {children}
    </UpsertPlanContext.Provider>
  );
};

export function useUpsertPlan() {
  return useContext(UpsertPlanContext);
}
