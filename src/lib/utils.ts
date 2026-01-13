/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function processImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Fill white background (optional, or transparent if png)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 1080, 1080)

      // Calculate cover logic
      const scale = Math.max(1080 / img.width, 1080 / img.height)
      const x = (1080 - img.width * scale) / 2
      const y = (1080 - img.height * scale) / 2

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas to Blob failed'))
        },
        'image/jpeg',
        0.9,
      )
    }
    img.onerror = reject
  })
}
