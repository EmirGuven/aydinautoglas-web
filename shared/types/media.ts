export interface MediaItem {
  id: string
  fileName: string
  originalFileName: string
  mimeType: string
  sizeBytes: number
  altText: Record<string, string>
  sizes: Record<string, string>
  createdAt: string
}
