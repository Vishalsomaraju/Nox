import sharp from 'sharp'
import { encode } from 'blurhash'

/**
 * Generate a blurhash string from an image buffer.
 * Resizes to 32x32 first for performance.
 */
export const generateBlurhash = async (imageBuffer) => {
  try {
    const { data, info } = await sharp(imageBuffer)
      .resize(32, 32, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const hash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      4
    )
    return hash
  } catch {
    return null
  }
}
