import * as Styled from "./question-preview.style";

import {
  QuestionAlternativeModel,
  QuestionModel,
} from "@/model/question.model";

type QuestionPreviewProps = QuestionModel & {
  alternatives: QuestionAlternativeModel[];
};

export function QuestionPreview({ text, alternatives }: QuestionPreviewProps) {
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: text }} />
      <Styled.AlternativesContainer>
        {alternatives.map(({ id, text, is_correct }, index) => {
          return (
            <Styled.Alternative key={id}>
              <Styled.AlternativeLetter $correct={is_correct}>
                {String.fromCharCode(65 + index)}
              </Styled.AlternativeLetter>
              <div dangerouslySetInnerHTML={{ __html: text }} />
            </Styled.Alternative>
          );
        })}
      </Styled.AlternativesContainer>
    </div>
  );
}
