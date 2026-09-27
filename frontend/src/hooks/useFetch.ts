import { useEffect, useState, type Dispatch, type DependencyList, type SetStateAction } from 'react'

interface UseFetchResult<T> {
  data: T | null
  setData: Dispatch<SetStateAction<T | null>>
  loading: boolean
  error: string
  setError: Dispatch<SetStateAction<string>>
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: DependencyList): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcher()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, setData, loading, error, setError }
}
