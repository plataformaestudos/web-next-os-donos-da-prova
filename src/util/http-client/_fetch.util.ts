const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const customFetch = <T>(
  token: string | undefined,
  resource: string,
  opts: RequestInit
) => {
  const url = baseUrl ? `${baseUrl}${resource}` : resource;
  return fetch(url, {
    headers: {
      ...opts.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...opts,
  }).then((response) => response.json() as T);
};
