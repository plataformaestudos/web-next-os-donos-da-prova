import type { QuoteAmounts } from "./quote-summary";

export interface ReferralPreviewPrice extends QuoteAmounts {
  planId: string;
  cycle: string;
  available: true;
}

export interface ReferralPreview {
  campaign: { title: string; slug: string };
  prices: (ReferralPreviewPrice | { planId: string; cycle: string; available: false })[];
  expiresAt: string;
}

export function parseReferralPreview(value: unknown): ReferralPreview | undefined {
  const record = (input: unknown): input is Record<string, unknown> => input !== null && typeof input === "object" && !Array.isArray(input);
  const invalid = () => new Error("Não foi possível consultar os preços da campanha. Tente novamente.");
  if (!record(value)) throw invalid();
  if (value.active === false) return undefined;
  if (value.active !== true || !record(value.campaign) || typeof value.campaign.title !== "string"
    || typeof value.campaign.slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value.campaign.slug)
    || typeof value.expiresAt !== "string" || !Number.isFinite(Date.parse(value.expiresAt)) || Date.parse(value.expiresAt) <= Date.now()
    || !Array.isArray(value.prices) || value.prices.length > 100) throw invalid();
  const seen = new Set<string>();
  const prices = value.prices.map(price => {
    if (!record(price) || typeof price.planId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(price.planId)
      || typeof price.cycle !== "string" || !["MONTHLY", "QUARTERLY", "SEMIANNUALLY", "YEARLY"].includes(price.cycle)) throw invalid();
    const key = `${price.planId}:${price.cycle}`;
    if (seen.has(key)) throw invalid();
    seen.add(key);
    if (price.available === false) return { planId: price.planId, cycle: price.cycle, available: false as const };
    const cents = (amount: unknown): amount is number => typeof amount === "number" && Number.isSafeInteger(amount) && amount >= 0;
    if (price.available !== true || !cents(price.baseAmountCents) || price.baseAmountCents <= 0
      || !cents(price.discountAmountCents) || !cents(price.finalAmountCents) || price.finalAmountCents <= 0
      || price.baseAmountCents - price.discountAmountCents !== price.finalAmountCents) throw invalid();
    return { planId: price.planId, cycle: price.cycle, available: true as const,
      baseAmountCents: price.baseAmountCents, discountAmountCents: price.discountAmountCents, finalAmountCents: price.finalAmountCents };
  });
  return { campaign: { title: value.campaign.title, slug: value.campaign.slug }, expiresAt: value.expiresAt, prices };
}

export function previewPrice(preview: ReferralPreview | undefined, planId: string, cycle: string): ReferralPreviewPrice | undefined {
  const price = preview?.prices.find(item => item.planId === planId && item.cycle === cycle);
  return price?.available ? price : undefined;
}
