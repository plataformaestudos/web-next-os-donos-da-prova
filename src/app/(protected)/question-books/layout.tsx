"use client";

import { CreateFolderProvider } from "@/question-books/create-folder/create-folder.context";

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CreateFolderProvider>{children}</CreateFolderProvider>;
}
