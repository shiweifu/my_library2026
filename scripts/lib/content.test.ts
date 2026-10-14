import { describe, expect, it } from 'vitest'
import { ContentValidationError, parseRecord } from './content'

const validBook = `---
type: book
title: 测试书
completedAt: 2026-10-13
tags: [测试]
myRating: 4.5
isbn: "9780140328721"
authors: [作者]
---

一段感受。
`

describe('content parser', () => {
  it('creates derived year, month and summary fields', () => {
    const record = parseRecord(validBook, '/content/books/2026-10-13-test.md')
    expect(record.year).toBe(2026)
    expect(record.month).toBe(10)
    expect(record.summary).toBe('一段感受。')
  })

  it('rejects ratings outside the allowed range', () => {
    expect(() => parseRecord(validBook.replace('4.5', '5.2'), 'bad.md')).toThrow(
      ContentValidationError,
    )
  })

  it('requires a rating capture date for Douban scores', () => {
    expect(() =>
      parseRecord(validBook.replace('myRating: 4.5', 'doubanRating: 8.8'), 'bad.md'),
    ).toThrow(/doubanRatingAsOf/)
  })
})
