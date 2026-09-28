import type { PropsWithChildren } from "react";
import { ImportAccess } from "@/question-imports/import-access.component";

export default function QuestionImportsLayout({ children }: PropsWithChildren) {
  return <ImportAccess>{children}</ImportAccess>;
}
