import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ExcalidrawCanvas } from './features/canvas'
import { FileBrowser } from './features/fileBrowser'
import { useDrawingStore } from './shared/store/drawingStore'

const queryClient = new QueryClient()

export default function App() {
  const [layout, setLayout] = useState<'browser' | 'editor'>('browser')
  const { drawingData, createNewDrawing } = useDrawingStore()

  const handleNewDrawing = () => {
    createNewDrawing()
    setLayout('editor')
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-screen h-screen flex bg-gray-50">
        {layout === 'browser' ? (
          <div className="w-full flex flex-col">
            <div className="p-4 bg-white border-b flex gap-3">
              <button
                onClick={handleNewDrawing}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
              >
                + New Image
              </button>
              <button
                onClick={() => setLayout('editor')}
                disabled={!drawingData}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                Open Editor
              </button>
            </div>
            <div className="flex-1">
              <FileBrowser
                onFileSelect={() => {
                  setLayout('editor')
                }}
              />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col">
            <div className="p-4 bg-white border-b flex gap-2">
              <button
                onClick={() => setLayout('browser')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Back to Browser
              </button>
            </div>
            <div className="flex-1">
              <ExcalidrawCanvas initialData={drawingData || undefined} />
            </div>
          </div>
        )}
      </div>
    </QueryClientProvider>
  )
}
