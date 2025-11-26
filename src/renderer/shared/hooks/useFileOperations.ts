import { useMutation, useQuery } from '@tanstack/react-query'
import { ipcApi, ExcalidrawData } from '../api/ipc'

export function useSaveFile() {
  return useMutation({
    mutationFn: ({ filename, data }: { filename: string; data: ExcalidrawData }) => ipcApi.saveFile(filename, data),
  })
}

export function useLoadFile() {
  return useMutation({
    mutationFn: (filePath?: string) => ipcApi.loadFile(filePath),
  })
}

export function useSaveThumbnail() {
  return useMutation({
    mutationFn: ({ filePath, imageData }: { filePath: string; imageData: string }) =>
      ipcApi.saveThumbnail(filePath, imageData),
  })
}

export function useBrowseFiles(directory?: string) {
  return useQuery({
    queryKey: ['files', directory],
    queryFn: () => ipcApi.browseFiles(directory),
    enabled: true,
  })
}
