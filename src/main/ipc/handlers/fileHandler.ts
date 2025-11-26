import { ipcMain, dialog, app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

interface ExcalidrawData {
  elements: any[]
  appState: any
}

export function setupFileHandlers() {
  // Save excalidraw file
  ipcMain.handle('file:save', async (event, { filename, data }: { filename: string; data: ExcalidrawData }) => {
    try {
      console.log('[IPC] file:save called with filename:', filename)

      // Get default save directory (Documents or Downloads)
      const documentsPath = path.join(os.homedir(), 'Documents')
      const defaultDir = fs.existsSync(documentsPath) ? documentsPath : os.homedir()

      const result = await dialog.showSaveDialog({
        defaultPath: path.join(defaultDir, filename.replace(/\.excalidraw$/, '') + '.excalidraw'),
        filters: [{ name: 'Excalidraw Files', extensions: ['excalidraw'] }],
      })

      console.log('[IPC] Save dialog result:', { canceled: result.canceled, filePath: result.filePath })

      if (!result.canceled && result.filePath) {
        const dirPath = path.dirname(result.filePath)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true })
        }

        fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2))
        console.log('[IPC] File saved successfully:', result.filePath)
        return { success: true, filePath: result.filePath }
      }

      console.log('[IPC] Save cancelled by user')
      return { success: false, error: 'Save cancelled' }
    } catch (error) {
      console.error('[IPC] Save error:', error)
      return { success: false, error: String(error) }
    }
  })

  // Load excalidraw file
  ipcMain.handle('file:load', async (event, filePath?: string) => {
    try {
      console.log('[IPC] file:load called with filePath:', filePath)
      let fileToLoad = filePath

      if (!fileToLoad) {
        const result = await dialog.showOpenDialog({
          filters: [{ name: 'Excalidraw Files', extensions: ['excalidraw'] }],
          properties: ['openFile'],
        })

        if (result.canceled || result.filePaths.length === 0) {
          console.log('[IPC] Load cancelled by user')
          return { success: false, error: 'Load cancelled' }
        }

        fileToLoad = result.filePaths[0]
      }

      console.log('[IPC] Loading file:', fileToLoad)
      const content = fs.readFileSync(fileToLoad, 'utf-8')
      const data = JSON.parse(content) as ExcalidrawData

      console.log('[IPC] File loaded successfully, elements:', data.elements?.length)
      return { success: true, data, filePath: fileToLoad }
    } catch (error) {
      console.error('[IPC] Load error:', error)
      return { success: false, error: String(error) }
    }
  })

  // Save thumbnail
  ipcMain.handle('file:saveThumbnail', async (event, { filePath, imageData }: { filePath: string; imageData: string }) => {
    try {
      console.log('[IPC] file:saveThumbnail called for:', filePath)
      const dir = path.dirname(filePath)
      const filename = path.basename(filePath, '.excalidraw')
      const thumbnailPath = path.join(dir, `${filename}.png`)

      const base64Data = imageData.replace(/^data:image\/png;base64,/, '')
      fs.writeFileSync(thumbnailPath, Buffer.from(base64Data, 'base64'))

      console.log('[IPC] Thumbnail saved:', thumbnailPath)
      return { success: true, thumbnailPath }
    } catch (error) {
      console.error('[IPC] Thumbnail save error:', error)
      return { success: false, error: String(error) }
    }
  })

  // Browse files
  ipcMain.handle('file:browse', async (event, directory?: string) => {
    try {
      const dir = directory || process.env.HOME || '/'
      const files = fs.readdirSync(dir, { withFileTypes: true })

      const result = files
        .filter((file) => file.name.endsWith('.excalidraw') || file.isDirectory())
        .map((file) => ({
          name: file.name,
          path: path.join(dir, file.name),
          isDirectory: file.isDirectory(),
          hasThumbnail: !file.isDirectory() && fs.existsSync(path.join(dir, file.name.replace(/\.excalidraw$/, '.png'))),
        }))

      return { success: true, files: result, currentPath: dir }
    } catch (error) {
      return { success: false, error: String(error), files: [], currentPath: '' }
    }
  })
}
