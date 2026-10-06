import { QuoteAmounts } from "./quote-summary";

export interface ReferralReadiness {
  planId: string;
  cycle: string;
  ready: boolean;
}

export interface ReferralOffer extends QuoteAmounts {
  campaign: { title: string; slug?: string };
}

export class ReferralRequestError extends Error {
  constructor(message: string, public readonly preservesPreviousOffer: boolean = false) {
    super(message);
  }
}

// Cookie mutations must finish in order, including requests from a previous mount.
export function createReferralRequestQueue() {
  let tail: Promise<void> = Promise.resolve();
  let pending = 0;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach(listener => listener());
  return {
    getPending: () => pending,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    enqueue<T>(request: () => Promise<T>): Promise<T> {
      pending += 1;
      notify();
      const result = tail.then(request).finally(() => { pending -= 1; notify(); });
      tail = result.then(() => undefined, () => undefined);
      return result;
    },
  };
}

export const referralRequestQueue = createReferralRequestQueue();

export function isReferralCheckoutReady(readiness: ReferralReadiness | null, planId: string, cycle: string): boolean {
  return referralRequestQueue.getPending() === 0 && readiness?.ready === true && readiness.planId === planId && readiness.cycle === cycle;
}

export function parseReferralOffer(value: unknown): ReferralOffer | undefined {
  if (!value || typeof value !== "object" || !("active" in value)) throw new Error("Não foi possível consultar o desconto. Tente novamente.");
  if (value.active === false) return undefined;
  if (value.active !== true || !("campaign" in value) || !value.campaign || typeof value.campaign !== "object" || !("title" in value.campaign) || typeof value.campaign.title !== "string") throw new Error("Não foi possível consultar o desconto. Tente novamente.");
  const cents = (amount: unknown): number => {
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount < 0) throw new Error("Não foi possível consultar o desconto. Tente novamente.");
    return amount;
  };
  return {
    campaign: { title: value.campaign.title, ...("slug" in value.campaign && typeof value.campaign.slug === "string" ? { slug: value.campaign.slug } : {}) },
    baseAmountCents: cents("baseAmountCents" in value ? value.baseAmountCents : undefined),
    discountAmountCents: cents("discountAmountCents" in value ? value.discountAmountCents : undefined),
    finalAmountCents: cents("finalAmountCents" in value ? value.finalAmountCents : undefined),
  };
}
