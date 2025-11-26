export interface ExcalidrawData {
  elements: any[]
  appState: any
}

interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  hasThumbnail: boolean
}

// Get the ipc API from either preload or direct require
const getIpcRenderer = () => {
  // Try preload first (production)
  if (window.electron?.ipcRenderer) {
    return window.electron.ipcRenderer
  }

  // Try direct require (development with nodeIntegration)
  try {
    const { ipcRenderer } = require('electron')
    return ipcRenderer
  } catch (e) {
    console.error('IPC not available:', e)
    return null
  }
}

export const ipcApi = {
  saveFile: async (filename: string, data: ExcalidrawData) => {
    const ipc = getIpcRenderer()
    if (!ipc) throw new Error('IPC not available')
    const response = await ipc.invoke('file:save', { filename, data })
    return response
  },

  loadFile: async (filePath?: string) => {
    const ipc = getIpcRenderer()
    if (!ipc) throw new Error('IPC not available')
    const response = await ipc.invoke('file:load', filePath)
    return response
  },

  saveThumbnail: async (filePath: string, imageData: string) => {
    const ipc = getIpcRenderer()
    if (!ipc) throw new Error('IPC not available')
    const response = await ipc.invoke('file:saveThumbnail', { filePath, imageData })
    return response
  },

  browseFiles: async (directory?: string) => {
    const ipc = getIpcRenderer()
    if (!ipc) throw new Error('IPC not available')
    const response = await ipc.invoke('file:browse', directory)
    return response
  },
}
