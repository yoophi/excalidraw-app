import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, listener: (...args: any[]) => void) => ipcRenderer.on(channel, (event, ...args) => listener(...args)),
    once: (channel: string, listener: (...args: any[]) => void) =>
      ipcRenderer.once(channel, (event, ...args) => listener(...args)),
    removeListener: (channel: string, listener: (...args: any[]) => void) => ipcRenderer.removeListener(channel, listener),
  },
})
