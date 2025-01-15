"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createExam(_: { message: string }, formData: FormData) {
  const nome = formData.get("nome") as string;

  if (!nome) {
    return { message: "Nome inválido" };
  }

  try {
    await fetch("http://localhost:3001/exams", {
      method: "POST",
      body: JSON.stringify({ nome }),
    });

    revalidatePath("/exams");
  } catch (e) {
    console.error(e);
    return { message: "Erro inesperado, tente novamente mais tarde!" };
  }

  return redirect("/exams");
}

export async function updateExam(_: { message: string }, formData: FormData) {
  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;

  if (!nome) {
    return { message: "Nome inválido" };
  }

  try {
    await fetch(`http://localhost:3001/exams/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nome }),
    });

    revalidatePath(`/exams/${id}`);
  } catch (e) {
    console.error(e);
    return { message: "Erro inesperado, tente novamente mais tarde!" };
  }

  return redirect(`/exams/${id}`);
}
