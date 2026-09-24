import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import Logo from '../components/Logo.jsx'

export default function Login() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to={location.state?.from || '/prehlad'} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(location.state?.from || '/prehlad', { replace: true })
    } catch (err) {
      setError(err.message)
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

        <h1 className="text-lg font-bold mb-1">Prihlásenie</h1>
        <p className="text-sm text-slate mb-5">Prihlás sa do administrácie B-Trans.</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Heslo"
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
          {loading ? 'Chvíľu...' : 'Prihlásiť sa'}
        </button>
      </form>
    </div>
  )
}
