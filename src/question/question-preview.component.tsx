import {
  QuestionAlternativeModel,
  QuestionModel,
} from "@/model/question.model";

import clsx from "clsx";

type QuestionPreviewProps = QuestionModel & {
  alternatives: QuestionAlternativeModel[];
};

export function QuestionPreview({ text, alternatives }: QuestionPreviewProps) {
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: text }} />
      <div className="mt-4 flex flex-col border border-gray-200 divide-y rounded-md">
        {alternatives.map(({ id, text, is_correct }, index) => {
          return (
            <div
              key={id}
              className={clsx(
                "flex items-center gap-2 p-2 cursor-pointer hover:bg-indigo-50 transition-colors",
                {
                  "rounded-t-md": index === 0,
                  "rounded-b-md": index === alternatives.length - 1,
                }
              )}
            >
              <span
                className={clsx(
                  "flex items-center justify-center rounded-full text-white w-6 h-6 text-xs",
                  is_correct
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-950"
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <div dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
