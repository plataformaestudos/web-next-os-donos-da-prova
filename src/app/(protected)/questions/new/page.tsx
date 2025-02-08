import { Button } from "antd";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { QuestionForm } from "@/question/question-form.component";
import { QuestionFormSubmitButton } from "@/question/question-form-submit-button.component";
import { UpserQuestionProvider } from "@/question/upsert/upsert-question.context";

export default function NewQuestionPage() {
  return (
    <UpserQuestionProvider>
      <div className="py-4 px-8 w-full">
        <div className="flex justify-between items-center pb-4 border-b border-b-gray-200">
          <div className="flex items-center gap-4">
            <Link href="/questions">
              <Button shape="circle" icon={<LuArrowLeft />} />
            </Link>
            <h1 className="text-3xl font-bold">Nova questão</h1>
          </div>
          <QuestionFormSubmitButton />
        </div>
        <div className="mt-4">
          <QuestionForm />
        </div>
      </div>
    </UpserQuestionProvider>
  );
}
