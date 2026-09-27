import type { Applicant, Driver, LogStopEntry, ReportData, User, Vehicle } from './types.ts'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string
}

async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie a skúste to znova.')
  }

  if (res.status === 204) return null as T

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `Chyba servera (${res.status})`)
  return data as T
}

interface AuthResponse {
  token: string
  user: User
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name: string, email: string, password: string, token?: string) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: { name, email, password }, token }),
  me: (token: string) => request<{ user: User }>('/auth/me', { token }),
  logout: (token: string) => request<null>('/auth/logout', { method: 'POST', token }),

  getDrivers: (token: string) => request<Driver[]>('/drivers', { token }),
  addDriver: (driver: Partial<Driver>, token: string) =>
    request<Driver>('/drivers', { method: 'POST', body: driver, token }),
  updateDriver: (id: string, patch: Partial<Driver>, token: string) =>
    request<Driver>(`/drivers/${id}`, { method: 'PATCH', body: patch, token }),
  deleteDriver: (id: string, token: string) => request<null>(`/drivers/${id}`, { method: 'DELETE', token }),

  getVehicles: (token: string) => request<Vehicle[]>('/vehicles', { token }),
  addVehicle: (vehicle: Partial<Vehicle>, token: string) =>
    request<Vehicle>('/vehicles', { method: 'POST', body: vehicle, token }),
  updateVehicle: (id: string, patch: Partial<Vehicle>, token: string) =>
    request<Vehicle>(`/vehicles/${id}`, { method: 'PATCH', body: patch, token }),
  deleteVehicle: (id: string, token: string) => request<null>(`/vehicles/${id}`, { method: 'DELETE', token }),

  getLogStops: (params: Record<string, string>, token: string) =>
    request<LogStopEntry[]>(`/logstops?${new URLSearchParams(params)}`, { token }),
  saveLogStop: (entry: { driver: string; date: string; stops: number; hours?: number | null }, token: string) =>
    request<LogStopEntry>('/logstops', { method: 'PUT', body: entry, token }),

  getReport: (year: number, month: number, token: string) =>
    request<ReportData>(`/report?year=${year}&month=${month}`, { token }),

  submitApplication: (applicant: { name: string; phone: string; email: string }) =>
    request<Applicant>('/applicants', { method: 'POST', body: applicant }),
}
