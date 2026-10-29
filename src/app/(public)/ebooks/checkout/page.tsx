import { Metadata } from "next";
import { EbookCheckout } from "@/ebooks/checkout";

export const metadata: Metadata = { title: "Comprar ebook", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function Page({ searchParams }: { searchParams: Promise<{ path?: string | string[] }> }) {
  const { path } = await searchParams;
  return <EbookCheckout path={typeof path === "string" ? path : ""} />;
}
