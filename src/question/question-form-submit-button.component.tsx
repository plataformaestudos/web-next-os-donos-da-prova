"use client";

import { Button } from "antd";
import { QUESTION_FORM_ID } from "./question-form.constant";
import { useUpsertQuestion } from "./upsert/upsert-question.context";

export function QuestionFormSubmitButton() {
  const { isPending } = useUpsertQuestion();

  return (
    <Button
      type="primary"
      size="large"
      form={QUESTION_FORM_ID}
      htmlType="submit"
      disabled={isPending}
      loading={isPending}
    >
      Salvar
    </Button>
  );
}
