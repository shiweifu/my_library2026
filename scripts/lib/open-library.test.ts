import { describe, expect, it } from 'vitest'
import { mapOpenLibraryBook } from './open-library'

describe('Open Library mapping', () => {
  it('prefers a stable OLID cover and maps bibliographic fields', () => {
    expect(
      mapOpenLibraryBook({
        title: '测试书',
        authors: [{ name: '作者甲' }],
        publishers: [{ name: '出版社' }],
        publish_date: '12 October 2021',
        identifiers: { openlibrary: ['OL123M'] },
        url: 'https://openlibrary.org/books/OL123M',
      }),
    ).toEqual({
      title: '测试书',
      authors: ['作者甲'],
      publisher: '出版社',
      publishedYear: 2021,
      cover: 'https://covers.openlibrary.org/b/olid/OL123M-L.jpg?default=false',
      sourceUrl: 'https://openlibrary.org/books/OL123M',
    })
  })
})
