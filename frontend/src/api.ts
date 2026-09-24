import { getIdentityToken } from "./identity";

const API_URL = "http://localhost:8000";

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_URL}${path}${query}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: getIdentityToken(), ...body }),
  });
  return res.json();
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const token = getIdentityToken();
  if (token) formData.set("token", token);
  const res = await fetch(`${API_URL}${path}`, { method: "POST", body: formData });
  return res.json();
}

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}
