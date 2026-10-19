import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const extensionByContentType: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
}

export function coverExtension(contentType: string | undefined, url: string): string {
  const normalizedType = contentType?.split(';')[0].trim().toLowerCase()
  if (normalizedType && extensionByContentType[normalizedType]) {
    return extensionByContentType[normalizedType]
  }

  try {
    const extension = path.extname(new URL(url).pathname).slice(1).toLowerCase()
    if (/^(?:avif|gif|jpe?g|png|svg|webp)$/.test(extension)) {
      return extension === 'jpeg' ? 'jpg' : extension
    }
  } catch {
    // The content type remains the authoritative source; an invalid URL has no useful suffix.
  }

  return 'jpg'
}

export function coverFileStem(source: string): string {
  const subjectId = source.match(/\/subject\/(\d+)/)?.[1]
  if (subjectId) {
    const mediaType = source.match(/^https?:\/\/(book|movie|music)\.douban\.com/i)?.[1]
    return `douban-${mediaType ? `${mediaType}-` : ''}${subjectId}`
  }

  const isbn = source
    .match(/\/isbn\/([\dXx-]+)/)?.[1]
    ?.replace(/-/g, '')
    .toUpperCase()
  if (isbn) return `isbn-${isbn}`

  return (
    source
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 64) || 'cover'
  )
}

export async function saveLocalCover(options: {
  bytes: Uint8Array
  contentType?: string
  imageUrl: string
  source: string
  projectRoot?: string
}): Promise<string> {
  const directory = path.resolve(options.projectRoot ?? process.cwd(), 'public', 'covers')
  await mkdir(directory, { recursive: true })
  const fileName = `${coverFileStem(options.source)}.${coverExtension(options.contentType, options.imageUrl)}`
  await writeFile(path.join(directory, fileName), options.bytes)
  return `covers/${fileName}`
}

export async function downloadLocalCover(options: {
  imageUrl: string
  source: string
  projectRoot?: string
}): Promise<string> {
  const response = await fetch(options.imageUrl, {
    headers: {
      Accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8',
      Referer: 'https://www.douban.com/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`封面下载返回 HTTP ${response.status}`)
  const contentType = response.headers.get('content-type') ?? undefined
  if (contentType && !contentType.toLowerCase().startsWith('image/')) {
    throw new Error(`封面返回了非图片内容：${contentType}`)
  }
  return saveLocalCover({
    bytes: new Uint8Array(await response.arrayBuffer()),
    contentType,
    imageUrl: options.imageUrl,
    source: options.source,
    projectRoot: options.projectRoot,
  })
}
