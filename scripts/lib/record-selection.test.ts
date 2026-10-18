import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { CulturalRecord } from '../../src/types/content'
import { findRecordCandidates, recordFilePath } from './record-selection'

const contentDirectory = '/project/content'
const book: CulturalRecord = {
  id: 'book-2026-10-03-fantastic-mr-fox',
  type: 'book',
  title: '了不起的狐狸爸爸',
  completedAt: '2026-10-03',
  year: 2026,
  month: 10,
  tags: [],
  isbn: '9780140328721',
  authors: ['罗尔德·达尔'],
  doubanUrl: 'https://book.douban.com/subject/1200840/',
  body: '',
  bodyHtml: '',
}

describe('record deletion selection', () => {
  it('derives the Markdown path from the stable record ID', () => {
    expect(recordFilePath(contentDirectory, book)).toBe(
      path.resolve(contentDirectory, 'books/2026-10-03-fantastic-mr-fox.md'),
    )
  })

  it.each([
    'book-2026-10-03-fantastic-mr-fox',
    '了不起的狐狸爸爸',
    '2026-10-03-fantastic-mr-fox.md',
    'https://book.douban.com/subject/1200840/',
  ])('finds a record by %s', (query) => {
    expect(findRecordCandidates([book], contentDirectory, query)).toHaveLength(1)
  })

  it('returns every exact-title match so deletion remains unambiguous', () => {
    const reread = { ...book, id: 'book-2027-01-02-fantastic-mr-fox' }
    expect(findRecordCandidates([book, reread], contentDirectory, book.title)).toHaveLength(2)
  })
})
