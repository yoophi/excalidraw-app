import React, { useRef, useEffect, useState } from 'react'
import { Excalidraw, MainMenu, exportToBlob } from '@excalidraw/excalidraw'
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import { useSaveFile, useSaveThumbnail } from '@/shared/hooks/useFileOperations'
import { useDrawingStore } from '@/shared/store/drawingStore'
import { ExcalidrawData } from '@/shared/api/ipc'

interface ExcalidrawCanvasProps {
  initialData?: ExcalidrawData
  onSave?: (data: ExcalidrawData) => void
}

export const ExcalidrawCanvas: React.FC<ExcalidrawCanvasProps> = ({ initialData, onSave }) => {
  const apiRef = useRef<ExcalidrawImperativeAPI>(null)
  const { currentFile, setDrawingData } = useDrawingStore()
  const saveFileMutation = useSaveFile()
  const saveThumbnailMutation = useSaveThumbnail()

  const handleSave = async () => {
    if (!apiRef.current) return

    const elements = apiRef.current.getSceneElements()
    const appState = apiRef.current.getAppState()

    const data: ExcalidrawData = { elements, appState }

    setDrawingData(data)
    onSave?.(data)

    // Save to file
    const filename = currentFile || `drawing_${Date.now()}`
    try {
      const result = await saveFileMutation.mutateAsync({ filename, data })
      if (result?.success) {
        // Save thumbnail
        const blob = await exportToBlob({
          elements,
          appState,
          exportPadding: 10,
        })
        const imageData = await blobToBase64(blob)
        await saveThumbnailMutation.mutateAsync({ filePath: result.filePath, imageData })
      }
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <h1 className="text-lg font-bold">Excalidraw</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={saveFileMutation.isPending}
        >
          {saveFileMutation.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="flex-1">
        <Excalidraw
          ref={apiRef}
          initialData={initialData}
          onChange={(elements, appState) => {
            // Auto-save can be implemented here
          }}
          UIOptions={{
            canvasMenu: {
              defaultItems: ['clearReset', 'export'],
            },
          }}
        />
      </div>
    </div>
  )
}
