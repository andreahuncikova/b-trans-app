import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../AuthContext.tsx'
import { api } from '../api.ts'
import Logo from '../components/Logo.tsx'

export default function ResetPassword() {
  const { setSession } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!token) return <Navigate to="/forgot-password" replace />

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.resetPassword(token, password)
      setSession(res.token, res.user)
      navigate('/prehlad', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-platinum p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-7">
        <Link to="/" className="inline-block mb-6">
          <Logo />
        </Link>

        <h1 className="text-lg font-bold mb-1">Nové heslo</h1>
        <p className="text-sm text-slate mb-5">Zadajte nové heslo pre váš účet.</p>

        <label htmlFor="reset-password" className="sr-only">Nové heslo</label>
        <input
          id="reset-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nové heslo"
          required
          minLength={8}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-60"
        >
          {loading ? 'Ukladám...' : 'Nastaviť heslo'}
        </button>
      </form>
    </div>
  )
}
