import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.tsx'
import Logo from '../components/Logo.tsx'

export default function NotFound() {
  const { token } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-platinum p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-7 text-center">
        <Link to="/" className="inline-block mb-6">
          <Logo />
        </Link>

        <h1 className="text-lg font-bold mb-1">Stránka nenájdená</h1>
        <p className="text-sm text-slate mb-5">Táto stránka neexistuje alebo bola presunutá.</p>

        <Link
          to={token ? '/prehlad' : '/'}
          className="inline-block bg-accent text-white rounded-lg px-5 py-3 font-semibold text-sm"
        >
          {token ? 'Späť na Prehľad' : 'Späť na úvod'}
        </Link>
      </div>
    </div>
  )
}
