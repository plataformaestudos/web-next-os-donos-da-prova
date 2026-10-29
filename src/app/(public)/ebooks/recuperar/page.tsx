import { Metadata } from "next";
import { EbookOrderStatusPage } from "@/ebooks/order-status";

export const metadata: Metadata = { title: "Recuperar ebook", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() { return <EbookOrderStatusPage orderId="recovery" />; }
