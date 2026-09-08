import { rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const target = path.join(root, 'dist', 'electron')

if (!existsSync(target)) {
  console.log('[clean-electron] Nada para limpar.')
  process.exit(0)
}

try {
  await rm(target, {
    recursive: true,
    force: true,
    maxRetries: 12,
    retryDelay: 500,
  })
  console.log(`[clean-electron] Pasta removida: ${target}`)
} catch (error) {
  if (error?.code === 'EBUSY' || error?.code === 'EPERM') {
    console.error('')
    console.error('[clean-electron] Não foi possível limpar a pasta do build.')
    console.error('Fecha qualquer janela do PLUSE, termina processos Electron/Pluse no Gestor de Tarefas e tenta novamente.')
    console.error(`Pasta bloqueada: ${target}`)
    console.error('')
  }
  throw error
}
