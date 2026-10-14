/// <reference types="vite/client" />

declare module 'virtual:records' {
  import type { CulturalRecord } from '@/types/content'
  const records: CulturalRecord[]
  export default records
}
