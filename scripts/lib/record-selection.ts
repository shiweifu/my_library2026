import path from 'node:path'
import type { CulturalRecord, MediaType } from '../../src/types/content'

export interface RecordCandidate {
  record: CulturalRecord
  file: string
}

const typeDirectories: Record<MediaType, string> = {
  book: 'books',
  movie: 'movies',
  music: 'music',
}

export function recordFilePath(contentDirectory: string, record: CulturalRecord): string {
  const prefix = `${record.type}-`
  if (!record.id.startsWith(prefix)) throw new Error(`无法从记录 ID 还原文件名：${record.id}`)
  const fileName = `${record.id.slice(prefix.length)}.md`
  return path.resolve(contentDirectory, typeDirectories[record.type], fileName)
}

export function findRecordCandidates(
  records: CulturalRecord[],
  contentDirectory: string,
  query: string,
): RecordCandidate[] {
  const wanted = query.trim().toLocaleLowerCase('zh-CN')
  return records.flatMap((record) => {
    const file = recordFilePath(contentDirectory, record)
    const aliases = [
      record.id,
      record.title,
      record.doubanUrl,
      path.basename(file),
      path.relative(process.cwd(), file),
    ]
    const matches = aliases.some((alias) => alias?.toLocaleLowerCase('zh-CN') === wanted)
    return matches ? [{ record, file }] : []
  })
}
