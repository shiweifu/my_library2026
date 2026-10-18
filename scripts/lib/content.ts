import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type { CulturalRecord, MediaType } from '../../src/types/content'
import { isValidIsbn, normalizeIsbn } from './isbn'

const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true })
const mediaTypes: MediaType[] = ['book', 'movie', 'music']

export class ContentValidationError extends Error {
  constructor(public readonly problems: string[]) {
    super(problems.join('\n'))
    this.name = 'ContentValidationError'
  }
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name)
      return entry.isDirectory() ? walk(fullPath) : Promise.resolve([fullPath])
    }),
  )
  return nested.flat().filter((file) => file.endsWith('.md'))
}

function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return typeof value === 'number' ? value : Number(value)
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function assertDate(value: unknown, field: string, problems: string[]): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    problems.push(`${field} 必须是 YYYY-MM-DD 日期`)
    return false
  }
  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    problems.push(`${field} 不是有效日期`)
    return false
  }
  return true
}

function dateString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toISOString().slice(0, 10)
  return undefined
}

function validateRating(
  value: number | undefined,
  field: string,
  maximum: number,
  problems: string[],
) {
  if (value === undefined) return
  if (!Number.isFinite(value) || value < 0 || value > maximum) {
    problems.push(`${field} 必须在 0–${maximum} 之间`)
  }
  if (field === 'myRating' && value * 2 !== Math.round(value * 2)) {
    problems.push('myRating 必须以 0.5 为步进')
  }
}

export function parseRecord(source: string, file: string): CulturalRecord {
  const parsed = matter(source)
  const data = parsed.data as Record<string, unknown>
  const problems: string[] = []
  const relativeName = file.replace(/\\/g, '/').split('/').pop()?.replace(/\.md$/, '') ?? 'record'
  const type = data.type
  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const completedAt = dateString(data.completedAt)
  const tags = stringArray(data.tags)
  const myRating = optionalNumber(data.myRating)
  const doubanRating = optionalNumber(data.doubanRating)

  if (!mediaTypes.includes(type as MediaType)) problems.push('type 必须是 book、movie 或 music')
  if (!title) problems.push('title 不能为空')
  const validDate = assertDate(completedAt, 'completedAt', problems)
  validateRating(myRating, 'myRating', 5, problems)
  validateRating(doubanRating, 'doubanRating', 10, problems)

  if (data.doubanUrl !== undefined && !String(data.doubanUrl).startsWith('https://')) {
    problems.push('doubanUrl 必须是 https 链接')
  }
  if (doubanRating !== undefined) {
    assertDate(dateString(data.doubanRatingAsOf), 'doubanRatingAsOf', problems)
  }

  const base = {
    id: `${String(type)}-${relativeName}`,
    type: type as MediaType,
    title,
    completedAt: validDate ? completedAt : '1970-01-01',
    year: validDate ? Number(completedAt.slice(0, 4)) : 1970,
    month: validDate ? Number(completedAt.slice(5, 7)) : 1,
    cover: typeof data.cover === 'string' && data.cover ? data.cover : undefined,
    tags,
    myRating,
    doubanRating,
    doubanUrl: typeof data.doubanUrl === 'string' ? data.doubanUrl : undefined,
    doubanRatingAsOf: dateString(data.doubanRatingAsOf),
    sourceUrl: typeof data.sourceUrl === 'string' ? data.sourceUrl : undefined,
    description:
      typeof data.description === 'string' && data.description.trim()
        ? data.description.trim()
        : undefined,
    body: parsed.content.trim(),
    bodyHtml: markdown.render(parsed.content.trim()),
  }

  let record: CulturalRecord
  if (type === 'book') {
    const isbn = normalizeIsbn(String(data.isbn ?? ''))
    const authors = stringArray(data.authors)
    if (!isValidIsbn(isbn)) problems.push('isbn 不是有效的 ISBN-10 或 ISBN-13')
    if (authors.length === 0) problems.push('authors 至少需要一位作者')
    record = {
      ...base,
      type,
      isbn,
      authors,
      publisher: typeof data.publisher === 'string' ? data.publisher : undefined,
      publishedYear: optionalNumber(data.publishedYear),
    }
  } else if (type === 'movie') {
    const directors = stringArray(data.directors)
    if (directors.length === 0) problems.push('directors 至少需要一位导演')
    record = { ...base, type, directors, releaseYear: optionalNumber(data.releaseYear) }
  } else {
    const artists = stringArray(data.artists)
    if (artists.length === 0) problems.push('artists 至少需要一位艺术家')
    if (!['album', 'track'].includes(String(data.musicKind))) {
      problems.push('musicKind 必须是 album 或 track')
    }
    record = {
      ...base,
      type: 'music',
      artists,
      releaseYear: optionalNumber(data.releaseYear),
      musicKind: data.musicKind === 'track' ? 'track' : 'album',
    }
  }

  if (problems.length) {
    throw new ContentValidationError(problems.map((problem) => `${file}: ${problem}`))
  }
  return record
}

export async function loadContentRecords(contentDirectory: string): Promise<{
  records: CulturalRecord[]
  files: string[]
}> {
  const files = await walk(contentDirectory)
  const records: CulturalRecord[] = []
  const problems: string[] = []

  for (const file of files) {
    try {
      records.push(parseRecord(await readFile(file, 'utf8'), file))
    } catch (error) {
      if (error instanceof ContentValidationError) problems.push(...error.problems)
      else problems.push(`${file}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const seen = new Set<string>()
  records.forEach((record) => {
    if (seen.has(record.id)) problems.push(`记录 ID 重复：${record.id}`)
    seen.add(record.id)
  })

  if (problems.length) throw new ContentValidationError(problems)
  records.sort((left, right) => right.completedAt.localeCompare(left.completedAt))
  return { records, files }
}
