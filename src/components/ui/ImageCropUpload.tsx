import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop';
import { Upload, X, Crop as CropIcon, Check } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropUploadProps {
  onImageUpload: (file: File) => void;
  currentImage?: string | null;
  onImageRemove?: () => void;
  aspectRatio?: number; // e.g., 1 for square, 16/9 for landscape
  cropShape?: 'rect' | 'round';
}

const ImageCropUpload: React.FC<ImageCropUploadProps> = ({ 
  onImageUpload, 
  currentImage,
  onImageRemove,
  aspectRatio = 1, // Default to square crop
  cropShape = 'rect'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
      setIsCropping(false);
    }
  }, [currentImage]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      ));
    }
    setImageLoaded(true);
  }, [aspectRatio]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError(null);
    setOriginalFile(file);
    setImageLoaded(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height,
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          }
        }, 'image/jpeg', 0.9);
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !originalFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Create a new File from the cropped blob
      const croppedFile = new File([croppedImageBlob], originalFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      onImageUpload(croppedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsCropping(false);
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Failed to crop image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setPreviewUrl(null);
    setOriginalFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setImageLoaded(false);
    setIsCropping(false);
    setOriginalFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const handleImageError = () => {
    setError('Failed to load image');
    setPreviewUrl(null);
    setImageLoaded(false);
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative">
          {isCropping ? (
            <div className="space-y-4">
              <div className="relative">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(convertToPixelCrop(c, imgRef.current!.width, imgRef.current!.height))}
                  aspect={aspectRatio}
                  circularCrop={cropShape === 'round'}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={previewUrl}
                    style={{ maxHeight: '400px', maxWidth: '100%' }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={handleCropCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleCropComplete}
                  disabled={!completedCrop || isUploading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={16} />
                  <span>{isUploading ? 'Processing...' : 'Apply Crop'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                </div>
              )}
              <img
                src={previewUrl}
                alt="Preview"
                className={`w-full h-48 object-cover rounded-lg transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${
                  cropShape === 'round' ? 'rounded-full' : 'rounded-lg'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <X size={16} />
              </button>
              {!isCropping && originalFile && (
                <button
                  type="button"
                  onClick={() => setIsCropping(true)}
                  className="absolute top-2 left-2 p-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                  title="Crop image"
                >
                  <CropIcon size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-crop-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="image-crop-upload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {isUploading ? 'Processing...' : 'Click to upload image'}
            </span>
            <span className="text-xs text-gray-400">
              PNG, JPG up to 5MB • Will be cropped to {aspectRatio === 1 ? 'square' : 'custom ratio'}
            </span>
          </label>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {uploadProgress}% processed
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCropUpload;