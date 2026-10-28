import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop';
import { Upload, X, Crop as CropIcon, Check, Move, ArrowUp, ArrowDown, AlignCenter, RotateCcw, Image as ImageIcon } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

export interface AspectRatioOption {
  label: string;
  value: number | undefined;
}

interface ImageCropUploadProps {
  onImageUpload: (file: File) => void;
  currentImage?: string | null;
  onImageRemove?: () => void;
  aspectRatio?: number; // e.g. 16/9 for landscape header, 1 for square portrait
  aspectRatioOptions?: AspectRatioOption[];
  cropShape?: 'rect' | 'round';
}

const ImageCropUpload: React.FC<ImageCropUploadProps> = ({ 
  onImageUpload, 
  currentImage,
  onImageRemove,
  aspectRatio = 1,
  aspectRatioOptions,
  cropShape = 'rect'
}) => {
  const [currentAspect, setCurrentAspect] = useState<number | undefined>(aspectRatio);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentAspect(aspectRatio);
  }, [aspectRatio]);

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
      setIsCropping(false);
    } else {
      setPreviewUrl(null);
    }
  }, [currentImage]);

  const calculateInitialCrop = useCallback((width: number, height: number, aspect: number | undefined): Crop => {
    if (aspect) {
      const baseCrop = makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height,
      );

      if (aspect === 1) {
        return {
          ...baseCrop,
          x: (100 - baseCrop.width) / 2,
          y: Math.max(0, (100 - baseCrop.height) / 4),
        };
      }
      return centerCrop(baseCrop, width, height);
    }

    return {
      unit: '%',
      width: 90,
      height: 70,
      x: 5,
      y: 15,
    };
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = calculateInitialCrop(width, height, currentAspect);
    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
    setImageLoaded(true);
  }, [currentAspect, calculateInitialCrop]);

  const handleAspectChange = (newAspect: number | undefined) => {
    setCurrentAspect(newAspect);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const updatedCrop = calculateInitialCrop(width, height, newAspect);
      setCrop(updatedCrop);
      setCompletedCrop(convertToPixelCrop(updatedCrop, width, height));
    }
  };

  const setVerticalPosition = (position: 'top' | 'center' | 'bottom') => {
    if (!crop || !imgRef.current) return;
    const cropHeight = crop.height || 50;
    let newY = 0;
    if (position === 'center') {
      newY = Math.max(0, (100 - cropHeight) / 2);
    } else if (position === 'bottom') {
      newY = Math.max(0, 100 - cropHeight);
    }

    const updatedCrop: Crop = {
      ...crop,
      y: newY,
    };
    setCrop(updatedCrop);
    setCompletedCrop(convertToPixelCrop(updatedCrop, imgRef.current.width, imgRef.current.height));
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setError(null);
    setOriginalFile(file);
    setImageLoaded(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, cropToApply: PixelCrop): Promise<Blob> => {
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

      const outputWidth = Math.round(cropToApply.width * scaleX);
      const outputHeight = Math.round(cropToApply.height * scaleY);

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        cropToApply.x * scaleX,
        cropToApply.y * scaleY,
        cropToApply.width * scaleX,
        cropToApply.height * scaleY,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas export failed'));
          }
        }, 'image/jpeg', 0.95);
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev >= 90 ? 90 : prev + 15));
      }, 120);

      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      const fileName = originalFile ? originalFile.name : `header-${Date.now()}.jpg`;
      const croppedFile = new File([croppedImageBlob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      onImageUpload(croppedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsCropping(false);
      setPreviewUrl(URL.createObjectURL(croppedImageBlob));
    } catch (err: any) {
      console.error('Error cropping image:', err);
      setError('Could not process crop. Please choose another image or re-upload.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    if (!currentImage && !originalFile) {
      setPreviewUrl(null);
    } else if (currentImage) {
      setPreviewUrl(currentImage);
    }
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

  const isWideAspect = (currentAspect ?? aspectRatio) > 1.3;

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {previewUrl ? (
        <div className="space-y-3">
          {isCropping ? (
            /* Active Crop Selection Workspace */
            <div className="admin-card p-4 sm:p-5 bg-slate-900 text-white rounded-xl border border-slate-700 shadow-sm space-y-4">
              {/* Header instructions & mode bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-600/30 text-primary-400 flex items-center justify-center">
                    <CropIcon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Select Header Area
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Drag the box or its corner handles to select what area of the image is shown.
                    </p>
                  </div>
                </div>

                {/* Aspect Ratio Options */}
                {aspectRatioOptions && aspectRatioOptions.length > 0 && (
                  <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                    {aspectRatioOptions.map((opt, idx) => {
                      const isActive = opt.value === currentAspect || (opt.value === undefined && currentAspect === undefined);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAspectChange(opt.value)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                            isActive 
                              ? 'bg-primary-600 text-white shadow-xs' 
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Area Alignment Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <Move size={12} className="text-primary-400" />
                  Quick Align:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVerticalPosition('top')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-700/70 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <ArrowUp size={11} />
                    <span>Top</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerticalPosition('center')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-700/70 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <AlignCenter size={11} />
                    <span>Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerticalPosition('bottom')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-700/70 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <ArrowDown size={11} />
                    <span>Bottom</span>
                  </button>
                </div>
              </div>

              {/* Crop Canvas Viewport */}
              <div className="relative max-h-[500px] w-full flex items-center justify-center bg-slate-950/80 rounded-lg overflow-auto p-2 border border-slate-800">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => {
                    if (imgRef.current) {
                      setCompletedCrop(convertToPixelCrop(c, imgRef.current.width, imgRef.current.height));
                    }
                  }}
                  aspect={currentAspect}
                  circularCrop={cropShape === 'round'}
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    alt="Select area to show"
                    src={previewUrl}
                    crossOrigin="anonymous"
                    style={{ maxHeight: '420px', maxWidth: '100%' }}
                    onLoad={onImageLoad}
                    className="rounded block"
                  />
                </ReactCrop>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCropCancel}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleCropComplete}
                  disabled={!completedCrop || isUploading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] rounded-lg transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={14} />
                  <span>{isUploading ? 'Applying Area...' : 'Apply Selection'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Image Preview with Action Bar */
            <div className="admin-card overflow-hidden border border-slate-200 bg-slate-50 relative group">
              <div className={`relative w-full ${isWideAspect ? 'aspect-[16/9] max-h-72' : 'h-56'} bg-slate-900/10 flex items-center justify-center overflow-hidden`}>
                <img
                  src={previewUrl}
                  alt="Selected header preview"
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    cropShape === 'round' ? 'rounded-full' : 'rounded-none'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setError('Failed to load image preview')}
                />

                {/* Aspect Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold shadow-xs flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-primary-400" />
                  <span>{isWideAspect ? '16:9 Header' : 'Photo Preview'}</span>
                </div>

                {/* Quick overlay controls */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCropping(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm backdrop-blur-sm transition-all active:scale-95"
                    title="Change what area of the image is shown"
                  >
                    <CropIcon size={13} className="text-primary-300" />
                    <span>Select Area</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm backdrop-blur-sm transition-all active:scale-95"
                    title="Upload different image file"
                  >
                    <Upload size={13} />
                    <span className="hidden sm:inline">Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-sm transition-all active:scale-95"
                    title="Remove image"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Sub-bar info */}
              <div className="p-3 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <Check size={13} className="text-emerald-600" />
                  <span>Header image selected. Click <strong>"Select Area"</strong> to readjust visible framing anytime.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCropping(true)}
                  className="text-primary-600 hover:text-primary-700 font-semibold text-xs transition-colors"
                >
                  Adjust Framing
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            isDragOver 
              ? 'border-primary-500 bg-primary-50/70 scale-[1.01]' 
              : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50/80'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isDragOver ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                {isUploading 
                  ? 'Processing upload...' 
                  : isDragOver 
                    ? 'Drop image to adjust header area' 
                    : 'Click to upload or drag & drop photo'
                }
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PNG, JPG, or WEBP up to 10MB • You will be able to select the visible header area
              </p>
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="space-y-1.5">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-200 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 text-right">
            Processing image area... {uploadProgress}%
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-xs font-medium">{error}</p>
      )}
      
      {/* Hidden canvas for high-resolution cropping */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCropUpload;