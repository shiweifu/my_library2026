import path from 'node:path'
import { ContentValidationError, loadContentRecords } from './lib/content'

try {
  const { records } = await loadContentRecords(path.resolve(process.cwd(), 'content'))
  console.log(`内容校验通过：${records.length} 条记录`)
} catch (error) {
  if (error instanceof ContentValidationError) {
    console.error('内容校验失败：')
    error.problems.forEach((problem) => console.error(`- ${problem}`))
  } else {
    console.error(error)
  }
  process.exitCode = 1
}
