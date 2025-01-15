"use client";

import { createExam, updateExam } from "./exam.actions";

import { useActionState } from "react";

interface ExamDTO {
  id?: string;
  name: string;
}

export function ExamForm({
  defaultValues: { id, name },
  action,
}: {
  action: typeof createExam | typeof updateExam;
  defaultValues: Partial<ExamDTO>;
}) {
  const [state, formAction, pending] = useActionState(action, {
    message: "",
  });

  return (
    <form action={formAction}>
      {id && <input type="hidden" id="id" name="id" value={id} />}
      <label htmlFor="name">
        Nome
        <input type="text" id="name" name="name" required defaultValue={name} />
      </label>
      <p aria-live="polite">{state?.message}</p>
      <button disabled={pending}>Salvar</button>
    </form>
  );
}
