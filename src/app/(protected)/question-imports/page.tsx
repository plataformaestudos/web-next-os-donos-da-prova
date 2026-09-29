import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { ImportHome } from "@/question-imports/import-history.component";

export default async function QuestionImportsPage({
  searchParams,
}: {
  searchParams: Promise<{ nova?: string }>;
}) {
  const initialTab = (await searchParams).nova === "1" ? "new" : "history";
  return (
    <PageLayout title="Importações de questões" actions={[]}>
      <ImportHome key={initialTab} initialTab={initialTab} />
    </PageLayout>
  );
}
