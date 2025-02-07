"use server";

import { UpsertQuestionDTO } from "./question.dto";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export async function createQuestion({
  id,
  text,
  alternatives,
}: UpsertQuestionDTO) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .upsert({
      id,
      text,
    })
    .select();

  if (data?.length) {
    const [{ id: question_id }] = data;
    await supabase
      .from("question_alternatives")
      .delete()
      .eq("question_id", question_id);

    await supabase.from("question_alternatives").upsert(
      alternatives.map(({ id, text, is_correct }) => ({
        id,
        text,
        is_correct,
        question_id,
      })),
      { defaultToNull: false }
    );

    redirect(`/questions/${question_id}`);
  }
}
