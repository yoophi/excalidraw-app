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

export const ipcApi = {
  saveFile: async (filename: string, data: ExcalidrawData) => {
    const response = await window.electron?.ipcRenderer.invoke('file:save', { filename, data })
    return response
  },

  loadFile: async (filePath?: string) => {
    const response = await window.electron?.ipcRenderer.invoke('file:load', filePath)
    return response
  },

  saveThumbnail: async (filePath: string, imageData: string) => {
    const response = await window.electron?.ipcRenderer.invoke('file:saveThumbnail', { filePath, imageData })
    return response
  },

  browseFiles: async (directory?: string) => {
    const response = await window.electron?.ipcRenderer.invoke('file:browse', directory)
    return response
  },
}
