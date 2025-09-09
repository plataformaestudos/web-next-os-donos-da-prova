import { SignupDTO } from "./signup.dto";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function signUpClient(dto: SignupDTO): Promise<{ success: boolean; error: string | null; payload?: any }> {
  const res = await fetch(`${API_BASE}/subscription/new-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dto),
  });

  const payload = await res.json().catch(() => null);
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

  return { success: true, error: null, payload };
}

