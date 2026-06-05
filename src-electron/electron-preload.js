import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('pluseDesktop', {
  platform: process.platform,
  isDesktop: true,
})
