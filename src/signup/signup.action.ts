import { SignupDTO } from "./signup.dto";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface SignupData {
  id: string;
  costumerId?: string;
  value: number;
  creditCard?: {
    creditCardNumber: string;
    creditCardBrand: string;
    creditCardToken: string;
  };
}

export interface DefaultResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  error: string | null;
  total?: number;
  page?: number | null;
  itemsPerPage?: number | null;
}

export async function signUpClient(dto: SignupDTO): Promise<{ success: boolean; error: string | null; payload?: DefaultResponse<SignupData> }> {
  const res = await fetch(`${API_BASE}/subscription/new-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dto),
  });

  const payload: DefaultResponse<SignupData> | null = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.message || `Signup failed: ${res.status}`);
  }

  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      username: dto.userInfo.email,
      password: dto.userInfo.password,
    }),
  });

  if (!loginRes.ok) {
    const loginPayload = await loginRes.text().catch(() => "");
    return { success: false, error: `Login after signup failed: ${loginRes.status} ${loginPayload}` };
  }

  return { success: true, error: null, payload: payload ?? undefined };
}

