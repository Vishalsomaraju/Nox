import { decode } from 'blurhash'
import { useEffect, useRef } from 'react'

/**
 * Decode a blurhash string into pixel data
 * @param {string} hash - The blurhash string
 * @param {number} width - Output width in pixels
 * @param {number} height - Output height in pixels
 * @returns {Uint8ClampedArray} Pixel data (RGBA)
 */
export function decodeBlurhash(hash, width = 32, height = 32) {
  if (!hash) return null
  try {
    return decode(hash, width, height)
  } catch (err) {
    console.warn('Failed to decode blurhash:', err)
    return null
  }
}

/**
 * BlurhashCanvas - renders a decoded blurhash as a canvas element
 */
export function BlurhashCanvas({ hash, width = 32, height = 32, style = {}, className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!hash || !canvasRef.current) return

    const pixels = decodeBlurhash(hash, width, height)
    if (!pixels) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.createImageData(width, height)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)
  }, [hash, width, height])

  if (!hash) return null

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
    />
  )
}

export default BlurhashCanvas
