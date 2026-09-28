import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.ts'
import Logo from '../components/Logo.tsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.forgotPassword(email)
      setMessage(res.message)
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

        <h1 className="text-lg font-bold mb-1">Obnovenie hesla</h1>
        <p className="text-sm text-slate mb-5">Zadajte email, na ktorý vám pošleme odkaz na nastavenie nového hesla.</p>

        {message ? (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2.5 mb-3">{message}</p>
        ) : (
          <>
            <label htmlFor="forgot-email" className="sr-only">E-mail</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3"
            />

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-60"
            >
              {loading ? 'Odosielam...' : 'Odoslať odkaz'}
            </button>
          </>
        )}

        <Link to="/login" className="block text-center text-sm text-slate hover:text-ink mt-4">
          Späť na prihlásenie
        </Link>
      </form>
    </div>
  )
}
