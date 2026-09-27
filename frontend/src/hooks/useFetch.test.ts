import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFetch } from './useFetch.ts'

describe('useFetch', () => {
  it('starts in a loading state and resolves with data', async () => {
    const { result } = renderHook(() => useFetch(() => Promise.resolve(['a', 'b']), []))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual(['a', 'b'])
    expect(result.current.error).toBe('')
  })

  it('captures a rejected fetch as an error message', async () => {
    const { result } = renderHook(() => useFetch(() => Promise.reject(new Error('Nepodarilo sa načítať')), []))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Nepodarilo sa načítať')
  })

  it('re-fetches when deps change', async () => {
    let dep = 1
    const { result, rerender } = renderHook(() => useFetch(() => Promise.resolve(dep), [dep]))

    await waitFor(() => expect(result.current.data).toBe(1))

    dep = 2
    rerender()

    await waitFor(() => expect(result.current.data).toBe(2))
  })
})
