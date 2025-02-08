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
  }
);

export const UpserQuestionProvider = ({ children }: PropsWithChildren) => {
  const [, formAction, isPending] = useActionState(
    upsertQuestionAndAlternatives,
    false
  );

  return (
    <UpserQuestionContext.Provider
      value={{ upsertQuestion: formAction, isPending }}
    >
      {children}
    </UpserQuestionContext.Provider>
  );
};

export function useUpsertQuestion() {
  return useContext(UpserQuestionContext);
}
