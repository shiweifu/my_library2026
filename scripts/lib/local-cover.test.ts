import { describe, expect, it } from 'vitest'
import { coverExtension, coverFileStem } from './local-cover'

describe('local cover helpers', () => {
  it('prefers the response content type for the extension', () => {
    expect(coverExtension('image/webp; charset=binary', 'https://img.example/a.jpg')).toBe('webp')
  })

  it('falls back to a normalized URL extension', () => {
    expect(coverExtension(undefined, 'https://img.example/a.jpeg?size=large')).toBe('jpg')
  })

  it('uses stable Douban and ISBN file names', () => {
    expect(coverFileStem('https://movie.douban.com/subject/1291557/')).toBe('douban-movie-1291557')
    expect(coverFileStem('https://book.douban.com/isbn/978-0-14-032872-1/')).toBe(
      'isbn-9780140328721',
    )
  })
})
