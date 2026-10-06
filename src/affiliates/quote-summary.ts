import { formatCycleCharge } from "@/plans/plan-price-display";

export interface QuoteAmounts {
  baseAmountCents: number;
  discountAmountCents: number;
  finalAmountCents: number;
}
export function quoteSummary(cycle: string, quote: QuoteAmounts): string {
  const currency = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return `Valor regular por ciclo: ${currency(quote.baseAmountCents)}. Desconto por ciclo: ${currency(quote.discountAmountCents)}. Valor final: ${formatCycleCharge(cycle, quote.finalAmountCents / 100)}. A primeira cobrança corresponde ao valor final do ciclo. O desconto permanece nas renovações desta assinatura.`;
}
