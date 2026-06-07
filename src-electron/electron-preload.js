import { contextBridge, ipcRenderer } from 'electron'

/**
 * Lê argumentos passados via `additionalArguments` no BrowserWindow.
 */
function readArg(prefix) {
  for (const arg of process.argv) {
    if (arg.startsWith(prefix)) return arg.slice(prefix.length)
  }
  return null
}

contextBridge.exposeInMainWorld('pluseDesktop', {
  platform: process.platform,
  isDesktop: true,
  // URL do backend Python local (modo "local") OU URL remota (modo "remote")
  // — em ambos os casos, é onde o axios deve ir.
  backendUrl: readArg('--pluse-backend-url='),
  // True quando não há `app-config.json` (primeira execução) ou está mal-formado.
  needsSetup: readArg('--pluse-needs-setup=') === '1',
  /**
   * Abre uma URL no browser default. Usado p.ex. para Django admin.
   */
  openExternal: (url) => ipcRenderer.invoke('pluse:open-external', url),
  /**
   * Devolve a URL do backend ao renderer (fallback caso o argumento não chegue).
   */
  getBackendUrl: () => ipcRenderer.invoke('pluse:backend-url'),
  /**
   * Lê o `app-config.json` (ou null se não existir).
   */
  readConfig: () => ipcRenderer.invoke('pluse:read-config'),
  /**
   * Escreve novo `app-config.json`. Devolve `{ok: true}` ou `{ok: false, error}`.
   */
  writeConfig: (cfg) => ipcRenderer.invoke('pluse:write-config', cfg),
  /**
   * Reinicia a app (após mudança de config).
   */
  relaunch: () => ipcRenderer.invoke('pluse:relaunch'),
  /**
   * Testa se uma URL responde como backend PLUSE válido.
   * Devolve `{ok: true|false, status?, error?}`.
   */
  testBackend: (url) => ipcRenderer.invoke('pluse:test-backend', url),
})
