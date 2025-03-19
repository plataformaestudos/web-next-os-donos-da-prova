import { Breadcrumb } from "antd";
import Link from "next/link";
import { QuestionBook } from "@/question-books/question-book.component";
import { createClient } from "@/util/supabase/server";

function asSingle<T>(array: T[]) {
  return array as T;
}

export default async function QuestionBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: questionBook } = await supabase
    .from("question_books")
    .select(
      `
    id,
    name,
    folder:book_folders(id, name)
  `
    )
    .eq("id", id)
    .single();

  if (questionBook) {
    const breadcrumbItems = [
      {
        title: <Link href="/question-books">Meus cadernos</Link>,
      },
    ];

    if (asSingle(questionBook.folder)?.id) {
      breadcrumbItems.push({
        title: (
          <Link
            href={`/question-books?pasta=${asSingle(questionBook.folder).id}`}
          >
            {asSingle(questionBook.folder).name}
          </Link>
        ),
      });
    }

    breadcrumbItems.push({
      title: questionBook.name,
    });

    return (
      <div style={{ padding: "16px 32px", flex: 1 }}>
        <Breadcrumb style={{ marginBottom: 24 }} items={breadcrumbItems} />
        <QuestionBook />
      </div>
    );
  }
}
