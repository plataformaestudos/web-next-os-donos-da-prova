import { Metadata } from "next";
import { notFound } from "next/navigation";
import { EbookOrderStatusPage } from "@/ebooks/order-status";

export const metadata: Metadata = { title: "Seu pedido de ebook", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) notFound();
  return <EbookOrderStatusPage orderId={orderId} />;
}
