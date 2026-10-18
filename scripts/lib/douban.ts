import type { MediaType } from '../../src/types/content'

export interface DoubanMetadata {
  type: MediaType
  title?: string
  creators: string[]
  cover?: string
  rating?: number
  url: string
  isbn?: string
  publisher?: string
  publishedYear?: number
  releaseYear?: number
  genres: string[]
  description?: string
}

const hostTypes: Record<string, MediaType> = {
  'book.douban.com': 'book',
  'movie.douban.com': 'movie',
  'music.douban.com': 'music',
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  }
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    if (key.startsWith('#x')) return String.fromCodePoint(Number.parseInt(key.slice(2), 16))
    if (key.startsWith('#')) return String.fromCodePoint(Number.parseInt(key.slice(1), 10))
    return named[key.toLowerCase()] ?? entity
  })
}

function text(value: string): string {
  return decodeHtml(value.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g)) {
    result[match[1].toLowerCase()] = decodeHtml(match[3])
  }
  return result
}

function metaContent(html: string, key: string): string | undefined {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(match[0])
    if (attrs.property === key || attrs.name === key || attrs.itemprop === key) {
      return attrs.content?.trim()
    }
  }
  return undefined
}

function canonicalUrl(html: string, fallback: string): string {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0])
    if (attrs.rel?.split(/\s+/).includes('canonical') && attrs.href) return attrs.href
  }
  return metaContent(html, 'og:url') ?? fallback
}

function asNames(value: unknown): string[] {
  const items = Array.isArray(value) ? value : value ? [value] : []
  return items.flatMap((item) => {
    if (typeof item === 'string') return [item.trim()]
    if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
      return [item.name.trim()]
    }
    return []
  })
}

function jsonLdObjects(html: string): Record<string, unknown>[] {
  const objects: Record<string, unknown>[] = []
  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const parsed = JSON.parse(decodeHtml(match[1].trim())) as unknown
      const candidates = Array.isArray(parsed) ? parsed : [parsed]
      for (const candidate of candidates) {
        if (!candidate || typeof candidate !== 'object') continue
        const object = candidate as Record<string, unknown>
        const graph = Array.isArray(object['@graph']) ? object['@graph'] : [object]
        objects.push(...graph.filter((item): item is Record<string, unknown> => Boolean(item)))
      }
    } catch {
      // Douban pages do not always expose valid JSON-LD; HTML metadata remains the fallback.
    }
  }
  return objects
}

function yearFrom(value: unknown): number | undefined {
  const match = String(value ?? '').match(/\b(1[5-9]\d{2}|20\d{2}|21\d{2})\b/)
  return match ? Number(match[1]) : undefined
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])]
}

function infoFragment(html: string, labels: string[]): string | undefined {
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const match = html.match(
    new RegExp(
      `<span[^>]*class=["'][^"']*pl[^"']*["'][^>]*>\\s*(?:${escaped})\\s*[:：]?\\s*</span>([\\s\\S]*?)(?:<br\\s*\\/?>|</div>)`,
      'i',
    ),
  )
  return match?.[1]
}

function namesFromFragment(fragment: string | undefined): string[] {
  if (!fragment) return []
  const links = [...fragment.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => text(match[1]))
  if (links.length) return unique(links)
  return unique(text(fragment).split(/[/,，]/))
}

function numberFrom(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(value.trim())
  return Number.isFinite(parsed) ? parsed : undefined
}

export function parseDoubanPage(
  html: string,
  requestedUrl: string,
  type: MediaType,
): DoubanMetadata {
  const jsonLd = jsonLdObjects(html).find((item) => item.name || item.headline) ?? {}
  const itemTitle = html.match(/property=["']v:itemreviewed["'][^>]*>([\s\S]*?)<\//i)?.[1]
  const title =
    (typeof jsonLd.name === 'string' ? jsonLd.name.trim() : undefined) ??
    (itemTitle ? text(itemTitle) : undefined) ??
    metaContent(html, 'og:title')
      ?.replace(/\s*\(豆瓣\)\s*$/, '')
      .trim()

  const image = jsonLd.image
  const cover =
    (typeof image === 'string'
      ? image
      : image && typeof image === 'object' && 'url' in image && typeof image.url === 'string'
        ? image.url
        : undefined) ?? metaContent(html, 'og:image')
  const ratingObject =
    jsonLd.aggregateRating && typeof jsonLd.aggregateRating === 'object'
      ? (jsonLd.aggregateRating as Record<string, unknown>)
      : undefined
  const rating =
    numberFrom(String(ratingObject?.ratingValue ?? '')) ??
    numberFrom(metaContent(html, 'ratingValue')) ??
    numberFrom(html.match(/property=["']v:average["'][^>]*>([\d.]+)/i)?.[1])

  const directedBy = [...html.matchAll(/rel=["']v:directedBy["'][^>]*>([\s\S]*?)<\/a>/gi)].map(
    (match) => text(match[1]),
  )
  const creators =
    type === 'book'
      ? unique([...asNames(jsonLd.author), ...namesFromFragment(infoFragment(html, ['作者']))])
      : type === 'movie'
        ? unique([...asNames(jsonLd.director), ...directedBy])
        : unique([
            ...asNames(jsonLd.byArtist),
            ...asNames(jsonLd.author),
            ...namesFromFragment(infoFragment(html, ['表演者', '艺术家'])),
          ])
  const genres = unique([
    ...(Array.isArray(jsonLd.genre) ? jsonLd.genre.map(String) : asNames(jsonLd.genre)),
    ...[...html.matchAll(/property=["']v:genre["'][^>]*>([\s\S]*?)<\//gi)].map((match) =>
      text(match[1]),
    ),
  ])
  const year =
    yearFrom(jsonLd.datePublished) ??
    yearFrom(html.match(/class=["']year["'][^>]*>([\s\S]*?)<\//i)?.[1]) ??
    yearFrom(infoFragment(html, type === 'book' ? ['出版年'] : ['发行时间', '上映日期']))
  const rawIsbn = text(infoFragment(html, ['ISBN']) ?? '').replace(/[^\dXx]/g, '')
  const publisher = text(infoFragment(html, ['出版社', '出版者']) ?? '') || undefined
  const microdataSummary =
    html.match(/property=["']v:summary["'][^>]*>([\s\S]*?)<\//i)?.[1] ??
    html.match(
      /id=["']link-report["'][\s\S]*?<div[^>]*class=["']intro["'][^>]*>([\s\S]*?)<\/div>/i,
    )?.[1]
  const description =
    (typeof jsonLd.description === 'string' ? text(jsonLd.description) : undefined) ??
    (microdataSummary ? text(microdataSummary) : undefined) ??
    metaContent(html, 'description')

  return {
    type,
    title,
    creators,
    cover: cover?.replace(/^http:/, 'https:'),
    rating,
    url: canonicalUrl(html, requestedUrl).replace(/^http:/, 'https:'),
    isbn: rawIsbn || undefined,
    publisher,
    publishedYear: type === 'book' ? year : undefined,
    releaseYear: type === 'book' ? undefined : year,
    genres,
    description: description?.trim(),
  }
}

export function doubanTypeFromUrl(value: string): MediaType | undefined {
  try {
    return hostTypes[new URL(value).hostname.toLowerCase()]
  } catch {
    return undefined
  }
}

export async function fetchDoubanMetadata(
  value: string,
  expectedType?: MediaType,
): Promise<DoubanMetadata> {
  const parsed = new URL(value)
  const type = hostTypes[parsed.hostname.toLowerCase()]
  if (!type || !/^\/(?:subject\/\d+|isbn\/[\dXx-]+)\/?$/.test(parsed.pathname)) {
    throw new Error('请输入 book.douban.com、movie.douban.com 或 music.douban.com 的条目链接')
  }
  if (expectedType && type !== expectedType) {
    throw new Error(`链接属于 ${type}，与当前选择的 ${expectedType} 类型不一致`)
  }
  parsed.protocol = 'https:'
  parsed.search = ''
  parsed.hash = ''

  const response = await fetch(parsed, {
    redirect: 'follow',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.6',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`豆瓣返回 HTTP ${response.status}`)
  const html = await response.text()
  if (html.length > 5_000_000) throw new Error('豆瓣页面内容异常大，已停止解析')
  const finalType = doubanTypeFromUrl(response.url) ?? type
  const metadata = parseDoubanPage(html, response.url || parsed.toString(), finalType)
  if (!metadata.title) throw new Error('豆瓣页面未包含可识别的条目信息，可能触发了访问验证')
  return metadata
}

export function doubanIsbnUrl(isbn: string): string {
  return `https://book.douban.com/isbn/${encodeURIComponent(isbn)}/`
}
