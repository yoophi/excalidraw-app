import { BrowserWindow, app } from 'electron'
import path from 'path'
import { isDev } from '../utils/dev'

export function createWindow(): BrowserWindow {
  const webPreferences = isDev
    ? {
        // Development: use nodeIntegration for easier development
        nodeIntegration: true,
        contextIsolation: false,
      }
    : {
        // Production: use preload + context isolation
        preload: path.join(__dirname, '../preload/preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: true,
      }

  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      ...webPreferences,
    },
  })

  const rendererUrl = isDev ? 'http://localhost:5173' : `file://${path.join(app.getAppPath(), 'dist/renderer/index.html')}`

  window.loadURL(rendererUrl)

  if (isDev) {
    window.webContents.openDevTools()
  }

  return window
}
