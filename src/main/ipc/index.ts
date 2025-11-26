import { ipcMain } from 'electron'
import { setupFileHandlers } from './handlers/fileHandler'

export function setupIPC() {
  setupFileHandlers()
}
