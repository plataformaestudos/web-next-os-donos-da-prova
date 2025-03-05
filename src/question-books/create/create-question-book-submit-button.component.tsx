"use client";

import { Button } from "antd";
import { CREATE_QUESTION_BOOK_FORM_ID } from "./create-question-book-form.constant";
import { LuBookPlus } from "react-icons/lu";
import { useCreateQuestionBook } from "./create-question-book.context";

export function CreateQuestionBookSubmitButton() {
  const { isPending } = useCreateQuestionBook();

  return (
    <Button
      type="primary"
      size="large"
      form={CREATE_QUESTION_BOOK_FORM_ID}
      htmlType="submit"
      disabled={isPending}
      loading={isPending}
      icon={<LuBookPlus />}
    >
      Salvar
    </Button>
  );
}
