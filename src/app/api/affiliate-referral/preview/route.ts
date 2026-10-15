import { NextRequest } from "next/server";
import { affiliateBackend, isRecord, isReferralToken, REFERRAL_COOKIE, referralJson, sameOrigin } from "@/affiliates/referral-server";
import { parseReferralPreview } from "@/affiliates/referral-preview";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return referralJson({ message: "Origem inválida." }, 403);
  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || Object.keys(body).length) return referralJson({ message: "Consulta inválida." }, 400);
  const referralToken = request.cookies.get(REFERRAL_COOKIE)?.value;
  if (!referralToken) return referralJson({ active: false });
  if (!isReferralToken(referralToken)) return referralJson({ message: "Indicação inválida. Remova o código ou informe-o novamente." }, 400);
  const response = await affiliateBackend(request, "/affiliate-links/public/preview", { referralToken });
  if (!response.ok) return response;
  const data: unknown = await response.json().catch(() => null);
  try {
    const preview = parseReferralPreview(isRecord(data) ? { ...data, active: true } : null);
    if (preview) return referralJson({ ...preview, active: true });
  } catch { /* A malformed response must not be displayed as a regular price. */ }
  return referralJson({ message: "Não foi possível validar os preços da campanha." }, 502);
}
