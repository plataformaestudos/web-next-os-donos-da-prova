export async function loginClient(email: string, password: string) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
    body: JSON.stringify({ username: email, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Login failed: ${res.status} ${text}`);
  }

  return await res.json().catch(() => null);
}

