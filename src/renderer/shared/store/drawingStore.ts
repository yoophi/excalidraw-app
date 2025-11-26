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
  },
})

export const useDrawingStore = create<DrawingState>((set) => ({
  currentFile: null,
  drawingData: null,
  setCurrentFile: (file: string) => set({ currentFile: file }),
  setDrawingData: (data: ExcalidrawData) => set({ drawingData: data }),
  clearDrawing: () => set({ currentFile: null, drawingData: null }),
  createNewDrawing: () => {
    const newDrawing = createEmptyDrawing()
    set({ currentFile: null, drawingData: newDrawing })
  },
}))
