"use client";

import {
  PropsWithChildren,
  createContext,
  useActionState,
  useContext,
} from "react";

import { UpsertQuestionDTO } from "../question.dto";
import { upsertQuestionAndAlternatives } from "./upsert-question.action";

const UpserQuestionContext = createContext(
  {} as {
    upsertQuestion: (payload: UpsertQuestionDTO) => void;
    isPending: boolean;
    error: string | null;
  }
);

export const UpserQuestionProvider = ({ children }: PropsWithChildren) => {
  const [response, formAction, isPending] = useActionState(
    upsertQuestionAndAlternatives,
    { error: null }
  );

  return (
    <UpserQuestionContext.Provider
      value={{
        upsertQuestion: formAction,
        isPending,
        error: response?.error ?? null,
      }}
    >
      {children}
    </UpserQuestionContext.Provider>
  );
};

export function useUpsertQuestion() {
  return useContext(UpserQuestionContext);
}
