export interface ImageOptimizeOptions {
  maxDimension?: number;
  quality?: number;
}

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.84;

function replaceFileExtension(fileName: string, ext: string): string {
  const dotIdx = fileName.lastIndexOf('.');
  const base = dotIdx > 0 ? fileName.slice(0, dotIdx) : fileName;
  return `${base}.${ext}`;
}

function canvasToBlobWithFallback(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<{ blob: Blob; mimeType: string; ext: string }> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (webpBlob) => {
        if (webpBlob && webpBlob.type === 'image/webp') {
          resolve({ blob: webpBlob, mimeType: 'image/webp', ext: 'webp' });
          return;
        }
        canvas.toBlob(
          (jpegBlob) => {
            if (jpegBlob) {
              resolve({ blob: jpegBlob, mimeType: 'image/jpeg', ext: 'jpg' });
            } else {
              reject(new Error('Canvas export failed'));
            }
          },
          'image/jpeg',
          quality
        );
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Exports a cropped region of an HTMLImageElement onto a canvas, scaling down
 * proportionally if either dimension exceeds `maxDimension` and encoding as WebP.
 */
export async function exportOptimizedCrop(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  originalFileName: string,
  options: ImageOptimizeOptions = {}
): Promise<{ file: File; blob: Blob }> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  let outputWidth = Math.max(1, Math.round(crop.width * scaleX));
  let outputHeight = Math.max(1, Math.round(crop.height * scaleY));

  if (outputWidth > maxDimension || outputHeight > maxDimension) {
    const downscale = Math.min(maxDimension / outputWidth, maxDimension / outputHeight);
    outputWidth = Math.max(1, Math.round(outputWidth * downscale));
    outputHeight = Math.max(1, Math.round(outputHeight * downscale));
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const { blob, mimeType, ext } = await canvasToBlobWithFallback(canvas, quality);
  const file = new File([blob], replaceFileExtension(originalFileName, ext), {
    type: mimeType,
    lastModified: Date.now(),
  });

  return { file, blob };
}

/**
 * Resizes and compresses an uploaded image File to WebP (skipping animated GIFs)
 * so Supabase Storage receives fast-loading web assets instead of multi-MB originals.
 */
export async function optimizeImageFile(
  file: File,
  options: ImageOptimizeOptions = {}
): Promise<File> {
  if (file.type === 'image/gif' || !file.type.startsWith('image/')) {
    return file;
  }

  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to decode image'));
      el.src = objectUrl;
    });

    let targetWidth = img.naturalWidth;
    let targetHeight = img.naturalHeight;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
      targetWidth = Math.max(1, Math.round(targetWidth * ratio));
      targetHeight = Math.max(1, Math.round(targetHeight * ratio));
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const { blob, mimeType, ext } = await canvasToBlobWithFallback(canvas, quality);
    if (blob.size >= file.size && file.type === 'image/webp') {
      return file;
    }

    return new File([blob], replaceFileExtension(file.name, ext), {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
