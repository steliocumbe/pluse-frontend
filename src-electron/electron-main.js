import { app, BrowserWindow, Menu, dialog, ipcMain, shell } from 'electron'
import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

let mainWindow
let backendProcess = null
let backendUrl = null
let needsSetup = false

/* ────────────────────────────────────────────────────────────────────
 * Config — %APPDATA%\PLUSE\app-config.json
 *
 * Estrutura:
 *   {
 *     "backend": {
 *       "mode": "local" | "remote",
 *       "remoteUrl": "http://192.168.1.10:8765"
 *     }
 *   }
 *
 * Em modo "local" o Electron spawna PLUSE-backend.exe localmente.
 * Em modo "remote" o Electron não spawna nada — usa remoteUrl como API.
 * ────────────────────────────────────────────────────────────────────*/

function configFilePath() {
  const base = process.env.APPDATA || process.env.LOCALAPPDATA || os.homedir()
  return path.join(base, 'PLUSE', 'app-config.json')
}

function statusFilePath() {
  const local = process.env.LOCALAPPDATA || process.env.APPDATA || os.homedir()
  return path.join(local, 'PLUSE', 'data', 'status.json')
}

function readConfig() {
  const p = configFilePath()
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch (err) {
    console.error('[config] JSON inválido em', p, err)
    return null
  }
}

function writeConfig(cfg) {
  const p = configFilePath()
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2), 'utf-8')
  return true
}

function normaliseUrl(u) {
  if (typeof u !== 'string') return ''
  return u.trim().replace(/\/+$/, '')
}

/* ────────────────────────────────────────────────────────────────────
 * Backend Python (PLUSE-backend.exe)
 *
 * Em modo "local" + packaged, o instalador NSIS coloca o backend em
 *   process.resourcesPath/backend/PLUSE-backend.exe
 *
 * No arranque (se for "local"), lançamos esse executável e fazemos
 * polling em status.json até encontrar `{"event":"ready","url":...}`.
 *
 * Em modo "remote", saltamos o spawn e usamos config.backend.remoteUrl
 * directamente como backendUrl.
 * ────────────────────────────────────────────────────────────────────*/

function backendExecutablePath() {
  if (!app.isPackaged) {
    return process.env.ELECTRON_BACKEND_EXE || null
  }
  const exeName = process.platform === 'win32' ? 'PLUSE-backend.exe' : 'PLUSE-backend'
  return path.join(process.resourcesPath, 'backend', exeName)
}

function startLocalBackend() {
  const exe = backendExecutablePath()
  if (!exe || !fs.existsSync(exe)) {
    console.warn('[backend] executável não encontrado, a saltar spawn.', exe)
    return Promise.resolve(null)
  }

  const statusPath = statusFilePath()
  try {
    fs.unlinkSync(statusPath)
  } catch {
    /* não existe — ok */
  }

  console.log('[backend] a lançar', exe)
  backendProcess = spawn(exe, [], {
    cwd: path.dirname(exe),
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
    detached: false,
  })

  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 60_000
    let pollTimer = null

    const cleanup = () => {
      if (pollTimer) clearTimeout(pollTimer)
    }

    const poll = () => {
      if (Date.now() > deadline) {
        cleanup()
        reject(new Error('Timeout (60s) à espera do backend arrancar.'))
        return
      }
      if (!backendProcess || backendProcess.exitCode !== null) {
        cleanup()
        reject(new Error('Backend saiu antes de ficar pronto.'))
        return
      }
      if (fs.existsSync(statusPath)) {
        try {
          const raw = fs.readFileSync(statusPath, 'utf-8')
          const msg = JSON.parse(raw)
          if (msg.event === 'ready') {
            console.log('[backend] pronto:', msg)
            backendUrl = msg.url
            cleanup()
            resolve(msg.url)
            return
          }
          if (msg.event === 'error') {
            cleanup()
            reject(new Error(msg.message || 'Erro do backend.'))
            return
          }
        } catch {
          /* JSON parcial — tenta de novo na próxima iteração */
        }
      }
      pollTimer = setTimeout(poll, 300)
    }

    backendProcess.on('exit', (code) => {
      console.warn('[backend] processo terminou com código', code)
      backendProcess = null
      if (!backendUrl) {
        cleanup()
        reject(new Error(`Backend saiu sem ficar pronto (exit ${code}).`))
      }
    })

    backendProcess.on('error', (err) => {
      cleanup()
      reject(err)
    })

    poll()
  })
}

function stopBackend() {
  if (!backendProcess) return
  console.log('[backend] a terminar…')
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(backendProcess.pid), '/F', '/T'])
    } else {
      backendProcess.kill('SIGTERM')
    }
  } catch (err) {
    console.error('[backend] erro a terminar', err)
  }
  backendProcess = null
}

/* ────────────────────────────────────────────────────────────────────
 * Resolver modo de arranque a partir do config
 * ────────────────────────────────────────────────────────────────────*/

async function resolveBackend() {
  const cfg = readConfig()

  if (!cfg) {
    // Primeira execução — sem config. Não arranca backend; mostra wizard.
    console.log('[config] sem app-config.json — vai mostrar wizard de setup.')
    needsSetup = true
    return null
  }

  const mode = cfg.backend?.mode
  if (mode === 'remote') {
    const url = normaliseUrl(cfg.backend?.remoteUrl)
    if (!url) {
      console.warn('[config] modo remoto sem URL — wizard de setup.')
      needsSetup = true
      return null
    }
    console.log('[config] modo remoto:', url)
    backendUrl = url
    return url
  }

  if (mode === 'local') {
    if (!app.isPackaged) {
      console.log('[config] modo local em dev — sem spawn (usa runserver à parte).')
      return null
    }
    return startLocalBackend()
  }

  console.warn('[config] modo desconhecido:', mode, '— wizard de setup.')
  needsSetup = true
  return null
}

/* ────────────────────────────────────────────────────────────────────
 * UI
 * ────────────────────────────────────────────────────────────────────*/

function createMenu() {
  const template = [
    {
      label: 'PLUSE',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Anular' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Seleccionar tudo' },
      ],
    },
    {
      label: 'Janela',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'zoom', label: 'Maximizar' },
        { role: 'close', label: 'Fechar' },
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

async function createWindow() {
  // Argumentos para o preload — incluem URL do backend e flag de setup.
  const additionalArguments = []
  if (backendUrl) additionalArguments.push(`--pluse-backend-url=${backendUrl}`)
  if (needsSetup) additionalArguments.push('--pluse-needs-setup=1')

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 820,
    minWidth: 1024,
    minHeight: 640,
    title: 'PLUSE',
    show: false,
    backgroundColor: '#f5f8fc',
    icon: path.resolve(currentDir, process.platform === 'win32' ? 'icons/icon.ico' : 'icons/icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments,
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          `electron-preload${process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION}`,
        ),
      ),
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }

    return { action: 'allow' }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL)
  } else {
    await mainWindow.loadFile('index.html')
  }
}

/* ────────────────────────────────────────────────────────────────────
 * IPC
 * ────────────────────────────────────────────────────────────────────*/

ipcMain.handle('pluse:open-external', async (_event, url) => {
  if (typeof url !== 'string') return false
  if (!/^https?:\/\//i.test(url)) return false
  await shell.openExternal(url)
  return true
})

ipcMain.handle('pluse:backend-url', () => backendUrl)
ipcMain.handle('pluse:read-config', () => readConfig())

ipcMain.handle('pluse:write-config', async (_event, cfg) => {
  // Validação básica
  if (!cfg || typeof cfg !== 'object') return { ok: false, error: 'config inválido' }
  const mode = cfg.backend?.mode
  if (mode !== 'local' && mode !== 'remote') {
    return { ok: false, error: 'mode tem de ser "local" ou "remote"' }
  }
  if (mode === 'remote') {
    const url = normaliseUrl(cfg.backend?.remoteUrl)
    if (!/^https?:\/\//i.test(url)) {
      return { ok: false, error: 'remoteUrl tem de começar por http:// ou https://' }
    }
    cfg.backend.remoteUrl = url
  }
  try {
    writeConfig(cfg)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
})

ipcMain.handle('pluse:relaunch', () => {
  // Reinicia o app para aplicar nova configuração.
  app.relaunch()
  app.exit(0)
  return true
})

ipcMain.handle('pluse:test-backend', async (_event, url) => {
  // Faz um GET simples para validar que há backend na URL fornecida.
  if (typeof url !== 'string') return { ok: false, error: 'url inválida' }
  const target = normaliseUrl(url) + '/api/v1/license/status/'
  try {
    const res = await fetch(target, { method: 'GET' })
    return { ok: res.ok || res.status === 401, status: res.status }
  } catch (err) {
    return { ok: false, error: err.message }
  }
})

/* ────────────────────────────────────────────────────────────────────
 * Ciclo de vida
 * ────────────────────────────────────────────────────────────────────*/

app.whenReady().then(async () => {
  createMenu()

  if (app.isPackaged) {
    try {
      await resolveBackend()
    } catch (err) {
      console.error('[backend] arranque falhou:', err)
      dialog.showErrorBox(
        'Erro ao iniciar o PLUSE',
        `Não foi possível arrancar o backend:\n\n${err.message}\n\n` +
          'Vais ver a janela na mesma — usa Configurações → Servidor para ajustar.\n' +
          'Verifica os logs em %LOCALAPPDATA%\\PLUSE\\data\\logs\\.',
      )
      // Não saímos — deixamos o user abrir o wizard.
      needsSetup = true
    }
  }

  await createWindow()

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopBackend()
})
