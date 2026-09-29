import Sidebar from '../components/Sidebar.tsx'
import Spinner from '../components/Spinner.tsx'
import { t } from '../i18n.ts'
import { useAuth } from '../AuthContext.tsx'
import { useFetch } from '../hooks/useFetch.ts'
import { api } from '../api.ts'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Applicants() {
  const { token } = useAuth()
  const { data: applicants, setData: setApplicants, loading, error, setError } = useFetch(
    () => api.getApplicants(token!),
    [token]
  )

  const removeApplicant = async (id: string) => {
    if (!window.confirm(t.applicants.deleteConfirm)) return
    try {
      await api.deleteApplicant(id, token!)
      setApplicants((as) => (as ? as.filter((a) => a._id !== id) : as))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col overflow-y-auto">
        <div className="mb-5 shrink-0">
          <h1 className="text-2xl font-bold">{t.applicants.title}</h1>
          <p className="text-slate text-sm mt-1">{t.applicants.subtitle}</p>
        </div>

        {error && <p className="text-sm text-red-600 mb-4 shrink-0">{error}</p>}

        {loading ? (
          <Spinner />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {(applicants ?? []).map((a, i) => (
              <div key={a._id} className={`flex items-center gap-3.5 px-5 py-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-ink text-platinum flex items-center justify-center text-sm font-semibold shrink-0">
                  {initials(a.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{a.name}</div>
                  <div className="text-sm text-slate truncate">
                    {[a.phone, a.email].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="text-xs text-gray-400 shrink-0">
                  {new Date(a.createdAt).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {a.cv ? (
                  <a
                    href={a.cv}
                    download={`zivotopis-${a.name}.pdf`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent-light text-accent shrink-0 hover:bg-accent hover:text-white transition-colors"
                  >
                    {t.applicants.downloadCv}
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 shrink-0">{t.applicants.noCv}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeApplicant(a._id)}
                  title="Vymazať žiadosť"
                  aria-label="Vymazať žiadosť"
                  className="text-gray-300 hover:text-red-500 shrink-0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  </svg>
                </button>
              </div>
            ))}
            {(applicants ?? []).length === 0 && (
              <div className="px-5 py-4 text-sm text-slate">{t.applicants.empty}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
