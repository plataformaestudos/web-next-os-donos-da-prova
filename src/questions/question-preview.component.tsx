"use client";

import * as Styled from "./question-preview.style";

import {
  QuestionAlternativeModel,
  QuestionModel,
  QuestionType,
} from "@/model/question.model";

import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";

type QuestionPreviewProps = QuestionModel & {
  alternatives: QuestionAlternativeModel[];
  compact?: boolean;
};

export function QuestionPreview({
  type,
  text,
  alternatives,
  compact = false,
}: QuestionPreviewProps) {
  return (
    <Styled.PreviewContainer $compact={compact}>
      <TiptapEditor editable={false} defaultValue={text} />
      {alternatives.length > 0 && (
        <Styled.AlternativesContainer>
          {alternatives.map(({ id, text, is_correct }, index) => {
            return (
              <Styled.Alternative key={id}>
                <Styled.AlternativeLetter $correct={is_correct}>
                  {type === QuestionType.MULTIPLE_CHOICE &&
                    String.fromCharCode(65 + index)}
                </Styled.AlternativeLetter>
                <TiptapEditor editable={false} defaultValue={text} />
              </Styled.Alternative>
            );
          })}
        </Styled.AlternativesContainer>
      )}
    </Styled.PreviewContainer>
  );
}
