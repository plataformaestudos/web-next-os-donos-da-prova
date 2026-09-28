import { ImportStatus } from "@/question-imports/import-status.component";

export default async function QuestionImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ImportStatus key={id} id={id} />;
}
