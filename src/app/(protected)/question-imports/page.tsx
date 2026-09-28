import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { ImportUpload } from "@/question-imports/import-upload.component";

export default function QuestionImportsPage() {
  return (
    <PageLayout title="Importar questões" actions={[]}>
      <ImportUpload />
    </PageLayout>
  );
}
