"use server";

import { UpsertQuestionDTO } from "../question.dto";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function upsertQuestionAndAlternatives(
  _: {
    error: string | null;
  },
  { id, text, comment, alternatives }: UpsertQuestionDTO
): Promise<{ error: string | null }> {
  if (!text) {
    return {
      error: "A pergunta não pode ser vazia",
    };
  }

  if (alternatives.length < 2 || alternatives.some(({ text }) => !text)) {
    return {
      error:
        "A pergunta deve ter no mínimo duas alternativas, e todas devem ser preenchidas",
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .upsert({
      id,
      text,
      comment,
    })
    .select();

  if (!data?.length) {
    return {
      error: "Questão não encontrada",
    };
  } else {
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

    revalidatePath(`/questions/${question_id}`);
    redirect(`/questions/${question_id}`);
  }
}
