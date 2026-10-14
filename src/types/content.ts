export type MediaType = 'book' | 'movie' | 'music'
export type MusicKind = 'album' | 'track'

interface BaseRecord {
  id: string
  type: MediaType
  title: string
  completedAt: string
  year: number
  month: number
  cover?: string
  tags: string[]
  myRating?: number
  doubanRating?: number
  doubanUrl?: string
  doubanRatingAsOf?: string
  sourceUrl?: string
  body: string
  bodyHtml: string
  summary: string
}

export interface BookRecord extends BaseRecord {
  type: 'book'
  isbn: string
  authors: string[]
  publisher?: string
  publishedYear?: number
}

export interface MovieRecord extends BaseRecord {
  type: 'movie'
  directors: string[]
  releaseYear?: number
}

export interface MusicRecord extends BaseRecord {
  type: 'music'
  artists: string[]
  releaseYear?: number
  musicKind: MusicKind
}

export type CulturalRecord = BookRecord | MovieRecord | MusicRecord

export const mediaLabels: Record<MediaType, string> = {
  book: '书',
  movie: '影',
  music: '音',
}

export function creatorsOf(record: CulturalRecord): string[] {
  if (record.type === 'book') return record.authors
  if (record.type === 'movie') return record.directors
  return record.artists
}
