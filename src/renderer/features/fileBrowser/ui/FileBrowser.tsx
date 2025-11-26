import React, { useState } from 'react'
import { useBrowseFiles, useLoadFile } from '@/shared/hooks/useFileOperations'
import { useDrawingStore } from '@/shared/store/drawingStore'

interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  hasThumbnail: boolean
}

interface FileBrowserProps {
  onFileSelect?: (filePath: string) => void
}

export const FileBrowser: React.FC<FileBrowserProps> = ({ onFileSelect }) => {
  const [currentDirectory, setCurrentDirectory] = useState<string>()
  const { data, isLoading } = useBrowseFiles(currentDirectory)
  const loadFileMutation = useLoadFile()
  const { setCurrentFile, setDrawingData } = useDrawingStore()

  const files: FileItem[] = data?.files || []
  const currentPath = data?.currentPath || ''

  const handleSelectFile = async (file: FileItem) => {
    if (file.isDirectory) {
      setCurrentDirectory(file.path)
      return
    }

    try {
      const result = await loadFileMutation.mutateAsync(file.path)
      if (result?.success) {
        setCurrentFile(file.path)
        setDrawingData(result.data)
        onFileSelect?.(file.path)
      }
    } catch (error) {
      console.error('Failed to load file:', error)
    }
  }

  const handleNavigateUp = () => {
    const parent = currentPath.split('/').slice(0, -1).join('/')
    setCurrentDirectory(parent || '/')
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold mb-2">File Browser</h2>
        <div className="text-sm text-gray-600 break-all">{currentPath}</div>
      </div>

      <div className="p-4">
        {currentPath !== '/' && (
          <button
            onClick={handleNavigateUp}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 font-semibold"
          >
            .. (Parent Directory)
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : files.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No files found</div>
        ) : (
          <div>
            {/* Directories first */}
            {files
              .filter((f) => f.isDirectory)
              .map((file) => (
                <div
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b flex items-center"
                >
                  <span className="text-xl mr-3">📁</span>
                  <span className="font-medium">{file.name}</span>
                </div>
              ))}

            {/* Files */}
            {files
              .filter((f) => !f.isDirectory)
              .map((file) => (
                <div
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b"
                >
                  <div className="flex items-start">
                    {file.hasThumbnail ? (
                      <img
                        src={`file://${file.path.replace(/\.excalidraw$/, '.png')}`}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded mr-3"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                        <span className="text-xl">🎨</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.path}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
