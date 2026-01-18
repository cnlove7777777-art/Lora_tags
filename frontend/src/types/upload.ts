export type UploadKind = 'zip' | 'folder'

export interface UploadItem {
  kind: UploadKind
  files: File[]
  displayName: string
  totalSize: number
  fileCount: number
  lastModified: number
  taskId?: number
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  message: string
}
