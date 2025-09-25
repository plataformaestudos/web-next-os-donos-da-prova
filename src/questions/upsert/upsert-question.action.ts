"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { QuestionType } from "@/model/question.model";
import { UpsertQuestionDTO } from "../question.dto";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export async function upsertQuestionAndAlternatives(
  _: { error: string | null },
  {
    id,
    text,
    type = QuestionType.MULTIPLE_CHOICE,
    comment,
    alternatives,
    module,
  }: UpsertQuestionDTO
) {
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
      type,
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

    if (module) {
      await supabase.from("modules_questions").delete().match({ question_id });
      await supabase.from("modules_questions").insert({ module_id: module, question_id });
    }

    revalidateTag(CACHE_TAGS.QUESTIONS);
    revalidatePath(`/questions/${question_id}`);
    redirect(`/questions/${question_id}`);

    return {
      error: null,
    };
  }
}
