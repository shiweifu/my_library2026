import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { stdin as input, stdout as output } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { loadContentRecords } from './lib/content'
import { findRecordCandidates } from './lib/record-selection'

const argumentsList = process.argv.slice(2)
const skipConfirmation = argumentsList.includes('--yes')
const query = argumentsList
  .filter((argument) => argument !== '--yes')
  .join(' ')
  .trim()
const contentDirectory = path.resolve(process.cwd(), 'content')

const { records } = await loadContentRecords(contentDirectory)

if (!query) {
  console.error('用法：pnpm record:delete <标题|记录ID|文件名|豆瓣链接> [--yes]')
  console.error('\n现有条目：')
  records.forEach((record) => console.error(`- ${record.id}  《${record.title}》`))
  process.exit(1)
}

const candidates = findRecordCandidates(records, contentDirectory, query)

if (candidates.length === 0) {
  console.error(`没有找到与“${query}”完全匹配的条目。`)
  console.error('可不带参数运行 pnpm record:delete 查看所有记录 ID。')
  process.exit(1)
}

if (candidates.length > 1) {
  console.error(`“${query}”匹配到多个条目，请改用下面的记录 ID：`)
  candidates.forEach(({ record }) => console.error(`- ${record.id}  ${record.completedAt}`))
  process.exit(1)
}

const [{ record, file }] = candidates
const relativeFile = path.relative(process.cwd(), file)
output.write(`将删除：\n- 《${record.title}》\n- ${record.completedAt}\n- ${relativeFile}\n`)

if (!skipConfirmation) {
  const readline = createInterface({ input, output })
  try {
    const answer = (await readline.question('输入“删除”确认：')).trim()
    if (answer !== '删除') {
      output.write('已取消，没有删除任何文件。\n')
      process.exit(0)
    }
  } finally {
    readline.close()
  }
}

await unlink(file)
output.write(`已删除 ${relativeFile}\n`)
output.write(`如需恢复：git restore -- ${relativeFile}\n`)
