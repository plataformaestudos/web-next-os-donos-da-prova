import { HttpError } from "@/lib/errors";

export function formatEbookPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100);
}

export function ebookErrorMessage(error: unknown) {
  if (error instanceof HttpError && error.data && typeof error.data === "object" && "message" in error.data) {
    const message: unknown = error.data.message;
    if (typeof message === "string" && message !== "Unauthorized") return message;
    if (Array.isArray(message) && message.every(item => typeof item === "string")) return message.join(" ");
  }
  if (error instanceof Error && error.message && error.message !== "Unauthorized") return error.message;
  return "Não foi possível concluir agora. Tente novamente em instantes.";
}
