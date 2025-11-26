import { create } from 'zustand'
import { ExcalidrawData } from '../api/ipc'

interface DrawingState {
  currentFile: string | null
  drawingData: ExcalidrawData | null
  setCurrentFile: (file: string) => void
  setDrawingData: (data: ExcalidrawData) => void
  clearDrawing: () => void
  createNewDrawing: () => void
}

const createEmptyDrawing = (): ExcalidrawData => ({
  elements: [],
  appState: {
    viewBackgroundColor: '#ffffff',
    zoom: { value: 1 },
    scrollX: 0,
    scrollY: 0,
    gridSize: 20,
    gridMode: false,
    collaborators: new Map(),
  },
})

/**
 * Sanitize appState to remove non-serializable properties and reconstruct Maps
 */
const sanitizeAppState = (appState: any) => {
  const sanitized = { ...appState }

  // Ensure collaborators is always a Map (required by Excalidraw)
  // When loading from JSON, it's a plain object, so we need to convert it
  if (!(sanitized.collaborators instanceof Map)) {
    sanitized.collaborators = new Map()
  }

  return sanitized
}

export const useDrawingStore = create<DrawingState>((set) => ({
  currentFile: null,
  drawingData: null,
  setCurrentFile: (file: string) => set({ currentFile: file }),
  setDrawingData: (data: ExcalidrawData) =>
    set({
      drawingData: {
        elements: data.elements,
        appState: sanitizeAppState(data.appState),
      },
    }),
  clearDrawing: () => set({ currentFile: null, drawingData: null }),
  createNewDrawing: () => {
    const newDrawing = createEmptyDrawing()
    set({ currentFile: null, drawingData: newDrawing })
  },
}))
