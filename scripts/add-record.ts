import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { stringify } from 'yaml'
import type { MediaType } from '../src/types/content'
import { isValidIsbn, normalizeIsbn } from './lib/isbn'
import { fetchBookByIsbn, type BookMetadata } from './lib/open-library'

const type = process.argv[2] as MediaType | undefined
if (!type || !['book', 'movie', 'music'].includes(type)) {
  console.error('用法：pnpm record:add <book|movie|music> [ISBN]')
  process.exit(1)
}

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

async function getBookMetadata(): Promise<{ isbn: string; metadata: BookMetadata }> {
  const raw = process.argv[3] ?? (await ask('ISBN'))
  const isbn = normalizeIsbn(raw)
  if (!isValidIsbn(isbn)) {
    console.error('ISBN 校验失败，请检查校验位。')
    process.exit(1)
  }

  output.write('正在查询 Open Library…\n')
  try {
    const metadata = await fetchBookByIsbn(isbn)
    if (!metadata) output.write('未找到对应版本，将创建手动补充模板。\n')
    return { isbn, metadata: metadata ?? { authors: [] } }
  } catch (error) {
    output.write(
      `查询失败，将创建手动补充模板：${error instanceof Error ? error.message : error}\n`,
    )
    return { isbn, metadata: { authors: [] } }
  }
}

try {
  const completedAt = await ask('完成日期', today)
  let fields: Record<string, unknown>
  let suggestedTitle = ''

  if (type === 'book') {
    const { isbn, metadata } = await getBookMetadata()
    const title = await ask('书名', metadata.title ?? '')
    suggestedTitle = title
    fields = {
      type,
      title,
      completedAt,
      cover: metadata.cover,
      tags: list(await ask('标签（逗号分隔）')),
      isbn,
      authors: list(await ask('作者（逗号分隔）', metadata.authors.join(', '))),
      publisher: await ask('出版社', metadata.publisher ?? ''),
      publishedYear: numberOrUndefined(
        await ask('出版年份', metadata.publishedYear?.toString() ?? ''),
      ),
      sourceUrl: metadata.sourceUrl ?? `https://openlibrary.org/isbn/${isbn}`,
    }
  } else if (type === 'movie') {
    const title = await ask('电影名')
    suggestedTitle = title
    fields = {
      type,
      title,
      completedAt,
      cover: await ask('封面地址'),
      tags: list(await ask('标签（逗号分隔）')),
      directors: list(await ask('导演（逗号分隔）')),
      releaseYear: numberOrUndefined(await ask('上映年份')),
    }
  } else {
    const title = await ask('音乐标题')
    suggestedTitle = title
    const musicKind = await ask('类型（album/track）', 'album')
    fields = {
      type,
      title,
      completedAt,
      cover: await ask('封面地址'),
      tags: list(await ask('标签（逗号分隔）')),
      artists: list(await ask('艺术家（逗号分隔）')),
      releaseYear: numberOrUndefined(await ask('发行年份')),
      musicKind,
    }
  }

  const myRating = numberOrUndefined(await ask('我的评分（0–5，可留空）'))
  const doubanRating = numberOrUndefined(await ask('豆瓣评分（0–10，可留空）'))
  const doubanUrl = await ask('豆瓣链接（可留空）')
  Object.assign(fields, {
    myRating,
    doubanRating,
    doubanUrl: doubanUrl || undefined,
    doubanRatingAsOf: doubanRating === undefined ? undefined : today,
  })

  const slug = await ask('文件短名', slugify(suggestedTitle) || type)
  const typeDirectory = type === 'book' ? 'books' : type === 'movie' ? 'movies' : 'music'
  const directory = path.resolve(process.cwd(), 'content', typeDirectory)
  await mkdir(directory, { recursive: true })
  const file = await nextAvailableFile(directory, `${completedAt}-${slugify(slug) || type}`)
  const yaml = stringify(fields, { lineWidth: 0 }).trim()
  await writeFile(file, `---\n${yaml}\n---\n\n`, 'utf8')

  output.write(`\n已创建 ${path.relative(process.cwd(), file)}\n`)
  output.write('请在文件正文补充感受，然后运行 pnpm content:validate。\n')
} finally {
  rl.close()
}
