"use client";

import {
  PropsWithChildren,
  createContext,
  useActionState,
  useContext,
} from "react";

import { QuestionBookDTO } from "./question-book.dto";
import { createQuestionBook } from "./create-question-book.action";

const CreateQuestionBookContext = createContext(
  {} as {
    createQuestionBook: (payload: Omit<QuestionBookDTO, "id">) => void;
    isPending: boolean;
    error: string | null;
  }
);

export const CreateQuestionProvider = ({ children }: PropsWithChildren) => {
  const [{ error }, formAction, isPending] = useActionState(
    createQuestionBook,
    { success: null, error: null }
  );

  return (
    <CreateQuestionBookContext.Provider
      value={{ createQuestionBook: formAction, isPending, error }}
    >
      {children}
    </CreateQuestionBookContext.Provider>
  );
};

export function useCreateQuestionBook() {
  return useContext(CreateQuestionBookContext);
}
