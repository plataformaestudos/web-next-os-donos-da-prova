import { ExamForm } from "../exam-form";
import { updateExam } from "../exam.actions";

export default async function UpdateExam({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const data = await fetch(`http://localhost:3001/concursos/${id}`);
  const { name } = await data.json();

  return <ExamForm defaultValues={{ id, name }} action={updateExam} />;
}
