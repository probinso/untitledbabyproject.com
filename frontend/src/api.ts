import { getIdentityToken } from "./identity";

const API_URL = "http://localhost:8000";

// The one place the identity token gets attached to a request — every
// method uses this, so it always travels the same way (a header), never
// mixed into a body or query string.
function tokenHeaders(): HeadersInit {
  const token = getIdentityToken();
  return token ? { "X-Identity-Token": token } : {};
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_URL}${path}${query}`, { headers: tokenHeaders() });
  return res.json();
}

export async function apiPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...tokenHeaders() },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: tokenHeaders(),
    body: formData,
  });
  return res.json();
}

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}
