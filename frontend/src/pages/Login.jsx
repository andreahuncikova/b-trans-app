import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function Login() {
  const { token, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
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
      if (mode === 'login') await login(email, password)
      else await register(name, email, password)
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
        <Link to="/" className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1F21" strokeWidth="2.5">
              <rect x="1" y="7" width="15" height="10" /><path d="M16 10h4l3 3v4h-7z" />
              <circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
            </svg>
          </div>
          <div className="font-display font-bold text-lg">B-Trans</div>
        </Link>

        <h1 className="text-lg font-bold mb-1">{mode === 'login' ? 'Prihlásenie' : 'Vytvoriť účet'}</h1>
        <p className="text-sm text-slate mb-5">
          {mode === 'login' ? 'Prihlás sa do administrácie B-Trans.' : 'Prvý vytvorený účet sa automaticky stane administrátorom.'}
        </p>

        {mode === 'register' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Meno a priezvisko"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3"
          />
        )}
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
          {loading ? 'Chvíľu...' : mode === 'login' ? 'Prihlásiť sa' : 'Vytvoriť účet'}
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          className="w-full text-center text-xs text-slate mt-4"
        >
          {mode === 'login' ? 'Nemáš účet? Vytvoriť prvý (admin) účet' : 'Už máš účet? Prihlásiť sa'}
        </button>
      </form>
    </div>
  )
}
