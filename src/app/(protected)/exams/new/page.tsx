import { ExamForm } from "../exam-form";
import { createExam } from "../exam.actions";

export default function NewExamPage() {
  return <ExamForm action={createExam} defaultValues={{}} />;
}
