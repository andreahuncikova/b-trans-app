import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.tsx'
import { useAuth } from '../AuthContext.tsx'

vi.mock('../AuthContext.tsx', () => ({
  useAuth: vi.fn(),
}))

function renderWithAuth(authValue: { token: string | null; ready: boolean }) {
  vi.mocked(useAuth).mockReturnValue(authValue as ReturnType<typeof useAuth>)
  return render(
    <MemoryRouter initialEntries={['/prehlad']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/prehlad"
          element={
            <ProtectedRoute>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('renders nothing while auth state is not ready', () => {
    const { container } = renderWithAuth({ token: null, ready: false })
    expect(container).toBeEmptyDOMElement()
  })

  it('redirects to /login when there is no token', () => {
    renderWithAuth({ token: null, ready: true })
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    renderWithAuth({ token: 'abc', ready: true })
    expect(screen.getByText('Secret content')).toBeInTheDocument()
  })
})
