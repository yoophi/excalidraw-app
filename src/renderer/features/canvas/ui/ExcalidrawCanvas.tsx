import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Excalidraw, MainMenu, exportToBlob } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
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
  const [canvasKey, setCanvasKey] = useState(0)

  // Create a memoized version of initialData to prevent unnecessary re-renders
  const memoizedInitialData = useMemo(() => {
    if (!initialData) return undefined
    return {
      ...initialData,
      elements: Array.isArray(initialData.elements) ? initialData.elements : [],
      appState: initialData.appState || {},
    }
  }, [initialData])

  const handleSave = async () => {
    console.log('Save button clicked, apiRef.current:', apiRef.current)

    if (!apiRef.current) {
      console.error('Excalidraw API not available')
      alert('Drawing not ready yet. Please wait a moment and try again.')
      return
    }

    try {
      console.log('Getting scene elements and app state...')
      const elements = apiRef.current.getSceneElements()
      const appState = apiRef.current.getAppState()

      console.log('Elements:', elements?.length, 'AppState:', appState)

      const data: ExcalidrawData = { elements, appState }

      setDrawingData(data)
      onSave?.(data)

      // Save to file
      const filename = currentFile || `drawing_${Date.now()}.excalidraw`
      console.log('Saving to file:', filename)

      const result = await saveFileMutation.mutateAsync({ filename, data })
      console.log('Save result:', result)

      if (result?.success) {
        console.log('File saved, creating thumbnail...')
        // Save thumbnail
        const blob = await exportToBlob({
          elements,
          appState,
          exportPadding: 10,
        })
        const imageData = await blobToBase64(blob)
        await saveThumbnailMutation.mutateAsync({ filePath: result.filePath, imageData })

        alert(`Drawing saved successfully!\nLocation: ${result.filePath}`)
        console.log('Thumbnail saved')
      } else {
        alert(`Failed to save: ${result?.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to save file:', error)
      alert(`Error saving file: ${error instanceof Error ? error.message : String(error)}`)
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
    <div className="w-full h-full flex flex-col" style={{ overflow: 'hidden' }}>
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b flex-shrink-0">
        <h1 className="text-lg font-bold">Excalidraw</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={saveFileMutation.isPending}
        >
          {saveFileMutation.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="flex-1" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
        <Excalidraw
          key={canvasKey}
          ref={apiRef}
          initialData={memoizedInitialData}
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
