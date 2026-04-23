const BASE = '/api/v1'

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, params?: Record<string, string | number | boolean>): Promise<T> {
  let url = `${BASE}${path}`
  if (params) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => sp.set(k, String(v)))
    url += `?${sp.toString()}`
  }
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options })
  const json: ApiEnvelope<T> = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error || json.message || 'API request failed')
  return json.data as T
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean>) => apiFetch<T>(path, {}, params),
  post: <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string, params?: Record<string, string | number | boolean>) => apiFetch<T>(path, { method: 'DELETE' }, params),
}
