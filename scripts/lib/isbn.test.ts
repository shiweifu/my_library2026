import { describe, expect, it } from 'vitest'
import { isValidIsbn, normalizeIsbn } from './isbn'

describe('ISBN tools', () => {
  it('normalizes spaces and hyphens', () => {
    expect(normalizeIsbn('978-0-14-032872-1')).toBe('9780140328721')
  })

  it('validates ISBN-10 and ISBN-13 check digits', () => {
    expect(isValidIsbn('0-306-40615-2')).toBe(true)
    expect(isValidIsbn('9780140328721')).toBe(true)
    expect(isValidIsbn('9780140328722')).toBe(false)
  })
})
