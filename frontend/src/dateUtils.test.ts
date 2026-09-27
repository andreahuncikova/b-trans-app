import { describe, it, expect } from 'vitest'
import { monthOptions, MONTH_NAMES } from './dateUtils.ts'

describe('monthOptions', () => {
  it('defaults to 4 months, most recent first', () => {
    const options = monthOptions()
    expect(options).toHaveLength(4)

    const now = new Date()
    expect(options[0].year).toBe(now.getFullYear())
    expect(options[0].month).toBe(now.getMonth() + 1)
    expect(options[0].label).toBe(`${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`)
  })

  it('walks backwards across a year boundary', () => {
    const options = monthOptions(13)
    const months = options.map((o) => `${o.year}-${o.month}`)
    expect(new Set(months).size).toBe(13)
  })

  it('respects a custom count', () => {
    expect(monthOptions(1)).toHaveLength(1)
    expect(monthOptions(6)).toHaveLength(6)
  })
})
