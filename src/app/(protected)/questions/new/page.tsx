import { Button } from "antd";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { QuestionForm } from "../question-form.component";

export default function NewQuestionPage() {
  return (
    <div className="py-4 px-8 w-full">
      <div className="flex justify-between items-center pb-4 border-b border-b-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/questions">
            <Button shape="circle" icon={<LuArrowLeft />} />
          </Link>
          <h1 className="text-3xl font-bold">Nova questão</h1>
        </div>
        <Button
          type="primary"
          size="large"
          form="new-question-form"
          htmlType="submit"
        >
          Salvar
        </Button>
      </div>
      <div className="mt-4">
        <QuestionForm />
      </div>
    </div>
  );
}
