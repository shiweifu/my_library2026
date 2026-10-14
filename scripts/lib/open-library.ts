interface OpenLibraryPerson {
  name?: string
}

interface OpenLibraryNamedValue {
  name?: string
}

interface OpenLibraryBook {
  title?: string
  authors?: OpenLibraryPerson[]
  publishers?: OpenLibraryNamedValue[]
  publish_date?: string
  cover?: { small?: string; medium?: string; large?: string }
  identifiers?: { openlibrary?: string[] }
  url?: string
}

export interface BookMetadata {
  title?: string
  authors: string[]
  publisher?: string
  publishedYear?: number
  cover?: string
  sourceUrl?: string
}

export function mapOpenLibraryBook(book: OpenLibraryBook | undefined): BookMetadata {
  if (!book) return { authors: [] }

  const cover = book.cover?.large ?? book.cover?.medium
  const openLibraryId = book.identifiers?.openlibrary?.[0]
  const coverById = openLibraryId
    ? `https://covers.openlibrary.org/b/olid/${openLibraryId}-L.jpg?default=false`
    : cover?.replace(/^http:/, 'https:')
  const yearMatch = book.publish_date?.match(/\b(1[5-9]\d{2}|20\d{2}|21\d{2})\b/)

  return {
    title: book.title?.trim(),
    authors: book.authors?.flatMap((author) => (author.name ? [author.name.trim()] : [])) ?? [],
    publisher: book.publishers?.find((publisher) => publisher.name)?.name?.trim(),
    publishedYear: yearMatch ? Number(yearMatch[1]) : undefined,
    cover: coverById,
    sourceUrl: book.url,
  }
}

export async function fetchBookByIsbn(isbn: string): Promise<BookMetadata | undefined> {
  const key = `ISBN:${isbn}`
  const url = new URL('https://openlibrary.org/api/books')
  url.searchParams.set('bibkeys', key)
  url.searchParams.set('jscmd', 'data')
  url.searchParams.set('format', 'json')

  const response = await fetch(url, {
    headers: { 'User-Agent': 'my-cultural-archive/0.1 (personal static site)' },
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error(`Open Library 返回 HTTP ${response.status}`)

  const payload = (await response.json()) as Record<string, OpenLibraryBook>
  const raw = payload[key]
  return raw ? mapOpenLibraryBook(raw) : undefined
}
