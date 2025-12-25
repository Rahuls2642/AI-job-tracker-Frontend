const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (
  path: string,
  token: string,
  options: RequestInit = {}
) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API request failed");
  }

  return res.json();
};
