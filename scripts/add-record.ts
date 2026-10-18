import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { stringify } from 'yaml'
import type { MediaType } from '../src/types/content'
import {
  doubanIsbnUrl,
  doubanTypeFromUrl,
  fetchDoubanMetadata,
  type DoubanMetadata,
} from './lib/douban'
import { isValidIsbn, normalizeIsbn } from './lib/isbn'
import { fetchBookByIsbn, type BookMetadata } from './lib/open-library'
import { parseRecordInput } from './lib/record-input'

let inputOptions: ReturnType<typeof parseRecordInput>
try {
  inputOptions = parseRecordInput(process.argv[2], process.argv[3])
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
const { type, source: sourceArgument } = inputOptions

const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date())

const rl = createInterface({ input, output })
const ask = async (label: string, fallback = '') => {
  const answer = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}：`)).trim()
  return answer || fallback
}
const list = (value: string) =>
  value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
const numberOrUndefined = (value: string) => (value ? Number(value) : undefined)
const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)

async function nextAvailableFile(directory: string, baseName: string) {
  let attempt = 1
  while (true) {
    const suffix = attempt === 1 ? '' : `-${attempt}`
    const file = path.join(directory, `${baseName}${suffix}.md`)
    try {
      await access(file)
      attempt += 1
    } catch {
      return file
    }
  }
}

async function queryDouban(
  url: string,
  expectedType: MediaType,
): Promise<DoubanMetadata | undefined> {
  output.write('正在读取豆瓣条目…\n')
  try {
    const metadata = await fetchDoubanMetadata(url, expectedType)
    output.write(`已读取豆瓣条目：${metadata.title ?? metadata.url}\n`)
    return metadata
  } catch (error) {
    output.write(
      `豆瓣读取失败，将保留链接并继续手动补充：${error instanceof Error ? error.message : error}\n`,
    )
    return undefined
  }
}

async function queryOpenLibrary(isbn: string): Promise<BookMetadata | undefined> {
  output.write('正在查询 Open Library…\n')
  try {
    const metadata = await fetchBookByIsbn(isbn)
    if (!metadata) output.write('Open Library 未找到对应版本。\n')
    return metadata
  } catch (error) {
    output.write(`Open Library 查询失败：${error instanceof Error ? error.message : error}\n`)
    return undefined
  }
}

interface BookImport {
  isbn: string
  douban?: DoubanMetadata
  openLibrary?: BookMetadata
  doubanUrl?: string
}

async function getBookMetadata(): Promise<BookImport> {
  const raw = sourceArgument ?? (await ask('豆瓣链接或 ISBN'))
  const isUrl = /^https?:\/\//i.test(raw)
  let douban: DoubanMetadata | undefined
  let doubanUrl: string | undefined
  let isbn = ''

  if (isUrl) {
    if (doubanTypeFromUrl(raw) !== 'book') {
      throw new Error('新增书籍时，请使用 book.douban.com 的条目链接')
    }
    doubanUrl = raw.replace(/^http:/, 'https:')
    douban = await queryDouban(doubanUrl, 'book')
    isbn = normalizeIsbn(douban?.isbn ?? '')
    if (!isValidIsbn(isbn)) isbn = normalizeIsbn(await ask('ISBN（豆瓣页面未提供，请补充）'))
  } else {
    isbn = normalizeIsbn(raw)
  }

  if (!isValidIsbn(isbn)) throw new Error('ISBN 校验失败，请检查校验位。')

  if (!isUrl) {
    const [doubanResult, openLibraryResult] = await Promise.allSettled([
      queryDouban(doubanIsbnUrl(isbn), 'book'),
      queryOpenLibrary(isbn),
    ])
    douban = doubanResult.status === 'fulfilled' ? doubanResult.value : undefined
    const openLibrary =
      openLibraryResult.status === 'fulfilled' ? openLibraryResult.value : undefined
    return { isbn, douban, openLibrary, doubanUrl: douban?.url }
  }

  return { isbn, douban, openLibrary: await queryOpenLibrary(isbn), doubanUrl }
}

async function getDoubanImport(mediaType: 'movie' | 'music') {
  const raw = sourceArgument ?? (await ask('豆瓣链接（可留空）'))
  if (!raw) return { douban: undefined, doubanUrl: undefined }
  if (doubanTypeFromUrl(raw) !== mediaType) {
    throw new Error(`新增${mediaType === 'movie' ? '电影' : '音乐'}时，请使用对应的豆瓣条目链接`)
  }
  const doubanUrl = raw.replace(/^http:/, 'https:')
  const douban = await queryDouban(doubanUrl, mediaType)
  return { douban, doubanUrl: douban?.url ?? doubanUrl }
}

try {
  const completedAt = await ask('完成日期', today)
  let fields: Record<string, unknown>
  let suggestedTitle = ''
  let importedDoubanRating: number | undefined
  let importedDoubanUrl: string | undefined
  let importedDescription = ''

  if (type === 'book') {
    const { isbn, douban, openLibrary, doubanUrl } = await getBookMetadata()
    const title = await ask('书名', douban?.title ?? openLibrary?.title ?? '')
    suggestedTitle = title
    importedDoubanRating = douban?.rating
    importedDoubanUrl = douban?.url ?? doubanUrl
    importedDescription = douban?.description ?? openLibrary?.description ?? ''
    fields = {
      type,
      title,
      completedAt,
      cover: douban?.cover ?? openLibrary?.cover,
      tags: list(await ask('标签（逗号分隔）', douban?.genres.join(', ') ?? '')),
      isbn,
      authors: list(
        await ask(
          '作者（逗号分隔）',
          (douban?.creators.length ? douban.creators : (openLibrary?.authors ?? [])).join(', '),
        ),
      ),
      publisher: await ask('出版社', douban?.publisher ?? openLibrary?.publisher ?? ''),
      publishedYear: numberOrUndefined(
        await ask(
          '出版年份',
          (douban?.publishedYear ?? openLibrary?.publishedYear)?.toString() ?? '',
        ),
      ),
      sourceUrl: openLibrary?.sourceUrl ?? `https://openlibrary.org/isbn/${isbn}`,
    }
  } else if (type === 'movie') {
    const { douban, doubanUrl } = await getDoubanImport('movie')
    const title = await ask('电影名', douban?.title ?? '')
    suggestedTitle = title
    importedDoubanRating = douban?.rating
    importedDoubanUrl = douban?.url ?? doubanUrl
    importedDescription = douban?.description ?? ''
    fields = {
      type,
      title,
      completedAt,
      cover: await ask('封面地址', douban?.cover ?? ''),
      tags: list(await ask('标签（逗号分隔）', douban?.genres.join(', ') ?? '')),
      directors: list(await ask('导演（逗号分隔）', douban?.creators.join(', ') ?? '')),
      releaseYear: numberOrUndefined(await ask('上映年份', douban?.releaseYear?.toString() ?? '')),
    }
  } else {
    const { douban, doubanUrl } = await getDoubanImport('music')
    const title = await ask('音乐标题', douban?.title ?? '')
    suggestedTitle = title
    importedDoubanRating = douban?.rating
    importedDoubanUrl = douban?.url ?? doubanUrl
    importedDescription = douban?.description ?? ''
    const musicKind = await ask('类型（album/track）', 'album')
    fields = {
      type,
      title,
      completedAt,
      cover: await ask('封面地址', douban?.cover ?? ''),
      tags: list(await ask('标签（逗号分隔）', douban?.genres.join(', ') ?? '')),
      artists: list(await ask('艺术家（逗号分隔）', douban?.creators.join(', ') ?? '')),
      releaseYear: numberOrUndefined(await ask('发行年份', douban?.releaseYear?.toString() ?? '')),
      musicKind,
    }
  }

  const myRating = numberOrUndefined(await ask('我的评分（0–5，可留空）'))
  const doubanRating = numberOrUndefined(
    await ask('豆瓣评分（0–10，可留空）', importedDoubanRating?.toString() ?? ''),
  )
  const doubanUrl = importedDoubanUrl ?? (await ask('豆瓣链接（可留空）'))
  const description = await ask('简介（可留空）', importedDescription)
  Object.assign(fields, {
    myRating,
    doubanRating,
    doubanUrl: doubanUrl || undefined,
    doubanRatingAsOf: doubanRating === undefined ? undefined : today,
    description: description || undefined,
  })

  const slug = await ask('文件短名', slugify(suggestedTitle) || type)
  const typeDirectory = type === 'book' ? 'books' : type === 'movie' ? 'movies' : 'music'
  const directory = path.resolve(process.cwd(), 'content', typeDirectory)
  await mkdir(directory, { recursive: true })
  const file = await nextAvailableFile(directory, `${completedAt}-${slugify(slug) || type}`)
  const yaml = stringify(fields, { lineWidth: 0 }).trim()
  await writeFile(file, `---\n${yaml}\n---\n\n`, 'utf8')

  output.write(`\n已创建 ${path.relative(process.cwd(), file)}\n`)
  output.write('可在文件正文补充个人评论，然后运行 pnpm content:validate。\n')
} finally {
  rl.close()
}
