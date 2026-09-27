import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from './Login.tsx'

const loginMock = vi.fn()

vi.mock('../AuthContext.tsx', () => ({
  useAuth: () => ({ token: null, login: loginMock }),
}))

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/prehlad" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Login page', () => {
  beforeEach(() => {
    loginMock.mockReset()
  })

  it('shows an error message when login fails', async () => {
    loginMock.mockRejectedValue(new Error('Nesprávny email alebo heslo'))
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('Heslo'), { target: { value: 'wrongpass1' } })
    fireEvent.click(screen.getByRole('button', { name: /prihlásiť sa/i }))

    expect(await screen.findByText('Nesprávny email alebo heslo')).toBeInTheDocument()
  })

  it('navigates to the dashboard after a successful login', async () => {
    loginMock.mockResolvedValue(undefined)
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('Heslo'), { target: { value: 'correctpass1' } })
    fireEvent.click(screen.getByRole('button', { name: /prihlásiť sa/i }))

    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
  })
})
