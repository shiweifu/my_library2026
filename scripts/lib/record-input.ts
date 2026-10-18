import type { MediaType } from '../../src/types/content'
import { doubanTypeFromUrl } from './douban'
import { isValidIsbn, normalizeIsbn } from './isbn'

export interface RecordInput {
  type: MediaType
  source?: string
}

const mediaTypes: MediaType[] = ['book', 'movie', 'music']

export function parseRecordInput(first?: string, second?: string): RecordInput {
  if (!first) {
    throw new Error('用法：pnpm record:add <豆瓣链接|ISBN|book|movie|music> [ISBN|豆瓣链接]')
  }

  const inferredType = doubanTypeFromUrl(first)
  if (inferredType) return { type: inferredType, source: first }

  if (/^https?:\/\//i.test(first)) {
    throw new Error('链接必须来自 book.douban.com、movie.douban.com 或 music.douban.com')
  }

  if (mediaTypes.includes(first as MediaType)) {
    return { type: first as MediaType, source: second }
  }

  const isbn = normalizeIsbn(first)
  if (isValidIsbn(isbn)) return { type: 'book', source: isbn }

  throw new Error('无法判断条目类型，请提供豆瓣条目链接、ISBN 或明确的类型')
}
