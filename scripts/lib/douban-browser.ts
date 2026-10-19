import { access } from 'node:fs/promises'
import path from 'node:path'
import { chromium, type BrowserContext, type Page } from 'playwright-core'
import type { MediaType } from '../../src/types/content'
import { doubanTypeFromUrl, parseDoubanPage, type DoubanMetadata } from './douban'
import { saveLocalCover } from './local-cover'

const executableCandidates = [
  process.env.DOUBAN_BROWSER_PATH,
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
].filter((value): value is string => Boolean(value))

async function browserExecutable(): Promise<string> {
  for (const candidate of executableCandidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Continue to the next known browser path.
    }
  }
  throw new Error('未找到 Chromium/Chrome；可通过 DOUBAN_BROWSER_PATH 指定浏览器路径')
}

function shouldWaitForVerification(metadata: DoubanMetadata, page: Page): boolean {
  const pageTitle = page.url().toLowerCase()
  return !metadata.title || !pageTitle.includes('douban.com/')
}

async function localizeCover(
  context: BrowserContext,
  metadata: DoubanMetadata,
): Promise<DoubanMetadata> {
  if (!metadata.cover) return metadata
  const response = await context.request.get(metadata.cover, {
    failOnStatusCode: true,
    headers: { Referer: metadata.url },
    timeout: 15_000,
  })
  const contentType = response.headers()['content-type']
  if (contentType && !contentType.toLowerCase().startsWith('image/')) {
    throw new Error(`封面返回了非图片内容：${contentType}`)
  }
  const cover = await saveLocalCover({
    bytes: await response.body(),
    contentType,
    imageUrl: metadata.cover,
    source: metadata.url,
  })
  return { ...metadata, cover }
}

export async function fetchDoubanMetadataInBrowser(options: {
  url: string
  expectedType: MediaType
  waitForVerification: () => Promise<void>
}): Promise<DoubanMetadata> {
  const executablePath = await browserExecutable()
  const userDataDir = path.resolve(process.cwd(), '.cache', 'douban-browser')
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath,
    headless: process.env.DOUBAN_BROWSER_HEADLESS === '1',
    locale: 'zh-CN',
    viewport: { width: 1280, height: 900 },
  })

  try {
    const page = context.pages()[0] ?? (await context.newPage())
    await page.goto(options.url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    let finalUrl = page.url()
    let type = doubanTypeFromUrl(finalUrl) ?? options.expectedType
    let metadata = parseDoubanPage(await page.content(), finalUrl, type)

    if (shouldWaitForVerification(metadata, page)) {
      await options.waitForVerification()
      await page.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => undefined)
      finalUrl = page.url()
      type = doubanTypeFromUrl(finalUrl) ?? options.expectedType
      metadata = parseDoubanPage(await page.content(), finalUrl, type)
    }

    if (!metadata.title) throw new Error('验证后仍未识别到豆瓣条目信息')
    if (type !== options.expectedType) {
      throw new Error(`链接属于 ${type}，与当前选择的 ${options.expectedType} 类型不一致`)
    }

    return await localizeCover(context, metadata).catch(() => metadata)
  } finally {
    await context.close()
  }
}
