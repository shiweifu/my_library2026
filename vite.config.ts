import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { loadContentRecords } from './scripts/lib/content'

const virtualId = 'virtual:records'
const resolvedVirtualId = `\0${virtualId}`

function recordsPlugin(): Plugin {
  return {
    name: 'cultural-archive-records',
    resolveId(id) {
      return id === virtualId ? resolvedVirtualId : undefined
    },
    async load(id) {
      if (id !== resolvedVirtualId) return undefined

      const contentDirectory = path.resolve(process.cwd(), 'content')
      const { records, files } = await loadContentRecords(contentDirectory)
      files.forEach((file) => this.addWatchFile(file))
      return `export default ${JSON.stringify(records)}`
    },
  }
}

export default defineConfig({
  base: (() => {
    const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
    return process.env.GITHUB_ACTIONS && repository && !repository.endsWith('.github.io')
      ? `/${repository}/`
      : '/'
  })(),
  plugins: [vue(), recordsPlugin()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
