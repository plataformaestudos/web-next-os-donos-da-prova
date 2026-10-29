import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { HttpError } from "@/lib/errors";
import { fetchPublicEbookPage } from "@/ebooks/api";
import { EbookLanding } from "@/ebooks/landing";
import { isCustomEbookPath } from "@/ebooks/public-path";

export const dynamic = "force-dynamic";
const loadPage = cache(async (path: string) => {
  if (!isCustomEbookPath(path)) notFound();
  try { return await fetchPublicEbookPage(path); }
  catch (error) { if (error instanceof HttpError && error.status === 404) notFound(); throw error; }
});
type Props = { params: Promise<{ ebookPath: string[] }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/${(await params).ebookPath.join("/")}`;
  const page = await loadPage(path);
  return { title: page.content.seoTitle || page.ebook.title, description: page.content.seoDescription || page.content.description, alternates: { canonical: page.path }, ...(page.content.socialImageUrl ? { openGraph: { images: [page.content.socialImageUrl] } } : {}) };
}
export default async function Page({ params }: Props) {
  const page = await loadPage(`/${(await params).ebookPath.join("/")}`);
  return <EbookLanding {...page} />;
}
