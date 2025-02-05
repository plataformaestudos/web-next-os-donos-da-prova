"use server";

import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";

export async function createQuestion(formData: FormData) {
  const statement = formData.get("statement");
  const options = formData.get("options")?.toString().split(",");
  const correctOption = formData.get("correctOption")?.toString();

  if (statement && options?.length && correctOption) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("questions")
      .insert({
        statement,
      })
      .select();

    if (data?.length) {
      const [{ id: question_id }] = data;
      await supabase.from("question_options").insert(
        options.map((description, index) => ({
          description,
          is_correct: parseInt(correctOption, 10) === index,
          question_id,
        }))
      );

      redirect(`/questions/${question_id}`);
    }
  }
}
