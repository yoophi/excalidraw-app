import { app, BrowserWindow } from 'electron'
import path from 'path'
import { isDev } from './utils/dev'
import { createWindow } from './services/window'
import { setupIPC } from './ipc'

let mainWindow: BrowserWindow | null = null

app.on('ready', () => {
  mainWindow = createWindow()
  setupIPC()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    mainWindow = createWindow()
  }
})
