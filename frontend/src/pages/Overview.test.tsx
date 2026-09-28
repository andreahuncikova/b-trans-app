import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Overview from './Overview.tsx'
import { api } from '../api.ts'
import { t } from '../i18n.ts'
import type { Driver } from '../types.ts'

vi.mock('../AuthContext.tsx', () => ({
  useAuth: () => ({ token: 'test-token', user: { name: 'Admin' }, logout: vi.fn() }),
}))

vi.mock('../api.ts', () => ({
  api: {
    getDrivers: vi.fn(),
    getLogStops: vi.fn(),
    getReport: vi.fn(),
  },
}))

const drivers: Driver[] = [
  { _id: 'd1', name: 'Jozef', role: '', type: 'permanent', status: 'active', createdAt: '', updatedAt: '' },
  { _id: 'd2', name: 'Peter', role: '', type: 'permanent', status: 'active', createdAt: '', updatedAt: '' },
]

const reportData = {
  rows: [
    { driver: { _id: 'd1', name: 'Jozef' }, days: 5, stops: 20 },
    { driver: { _id: 'd2', name: 'Peter' }, days: 3, stops: 9 },
  ],
  totals: { days: 8, stops: 29 },
}

function totalsTileValue(label: string) {
  return screen.getByText(label).nextElementSibling?.textContent
}

describe('Overview page', () => {
  beforeEach(() => {
    vi.mocked(api.getDrivers).mockResolvedValue(drivers)
    vi.mocked(api.getLogStops).mockResolvedValue([])
    vi.mocked(api.getReport).mockResolvedValue(reportData)
  })

  it('shows totals for all employees by default', async () => {
    render(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    )

    expect(await screen.findByText('8')).toBeInTheDocument()
    expect(totalsTileValue(t.overview.totalDays)).toBe('8')
    expect(totalsTileValue(t.overview.delivered)).toBe('29')
  })

  it('recomputes the totals tiles when a specific driver is selected', async () => {
    render(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    )

    await screen.findByText('8')

    const driverSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(driverSelect, { target: { value: 'd1' } })

    expect(await within(screen.getByText(t.overview.totalDays).parentElement!).findByText('5')).toBeInTheDocument()
    expect(totalsTileValue(t.overview.delivered)).toBe('20')
  })
})
