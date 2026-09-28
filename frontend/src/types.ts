export interface User {
  id: string
  name: string
  email: string
  role: 'admin'
}

export interface Driver {
  _id: string
  name: string
  role: string
  type: 'permanent' | 'substitute'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  _id: string
  name: string
  plate: string
  photo: string
  driver: { _id: string; name: string } | null
  lastStk: string | null
  stkIntervalYears: 1 | 2 | 4
  vignettePurchasedAt: string | null
  vignetteIntervalDays: 10 | 30 | 365
  inService: boolean
  serviceReason: string
  createdAt: string
  updatedAt: string
}

export interface LogStopEntry {
  _id: string
  driver: { _id: string; name: string } | null
  date: string
  stops: number
  createdAt: string
  updatedAt: string
}

export interface ReportRow {
  driver: { _id: string; name: string }
  days: number
  stops: number
}

export interface ReportData {
  rows: ReportRow[]
  totals: { days: number; stops: number }
}

export interface Applicant {
  _id: string
  name: string
  phone: string
  email: string
}
