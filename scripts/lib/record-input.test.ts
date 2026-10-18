import { describe, expect, it } from 'vitest'
import { parseRecordInput } from './record-input'

describe('record input', () => {
  it.each([
    ['https://book.douban.com/subject/1200840/', 'book'],
    ['https://movie.douban.com/subject/1291557/', 'movie'],
    ['https://music.douban.com/subject/1397546/', 'music'],
  ] as const)('infers %s from the Douban host', (url, type) => {
    expect(parseRecordInput(url)).toEqual({ type, source: url })
  })

  it('infers a book from a standalone ISBN', () => {
    expect(parseRecordInput('9780140328721')).toEqual({
      type: 'book',
      source: '9780140328721',
    })
  })

  it('keeps the legacy explicit type syntax', () => {
    expect(parseRecordInput('movie', 'https://movie.douban.com/subject/1291557/')).toEqual({
      type: 'movie',
      source: 'https://movie.douban.com/subject/1291557/',
    })
  })

  it('rejects an unrelated URL', () => {
    expect(() => parseRecordInput('https://example.com/subject/1/')).toThrow(/链接必须来自/)
  })
})
