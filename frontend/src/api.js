const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `Chyba servera (${res.status})`)
  return data
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password, token) =>
    request('/auth/register', { method: 'POST', body: { name, email, password }, token }),
  me: (token) => request('/auth/me', { token }),

  getDrivers: (token) => request('/drivers', { token }),
  addDriver: (driver, token) => request('/drivers', { method: 'POST', body: driver, token }),
  updateDriver: (id, patch, token) => request(`/drivers/${id}`, { method: 'PATCH', body: patch, token }),
  deleteDriver: (id, token) => request(`/drivers/${id}`, { method: 'DELETE', token }),

  getVehicles: (token) => request('/vehicles', { token }),
  addVehicle: (vehicle, token) => request('/vehicles', { method: 'POST', body: vehicle, token }),
  updateVehicle: (id, patch, token) => request(`/vehicles/${id}`, { method: 'PATCH', body: patch, token }),
  deleteVehicle: (id, token) => request(`/vehicles/${id}`, { method: 'DELETE', token }),

  getLogStops: (params, token) => request(`/logstops?${new URLSearchParams(params)}`, { token }),
  saveLogStop: (entry, token) => request('/logstops', { method: 'PUT', body: entry, token }),

  getReport: (year, month, token) => request(`/report?year=${year}&month=${month}`, { token }),

  submitApplication: (applicant) => request('/applicants', { method: 'POST', body: applicant }),
}
