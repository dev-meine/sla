import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxSlide {
  image: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
}

interface MediaLightboxProps {
  slides: LightboxSlide[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({
  slides,
  activeIndex,
  onClose,
  onChangeIndex
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < slides.length;
  const current = isOpen ? slides[activeIndex] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && slides.length > 1) {
        e.preventDefault();
        onChangeIndex((activeIndex + 1) % slides.length);
      } else if (e.key === 'ArrowLeft' && slides.length > 1) {
        e.preventDefault();
        onChangeIndex((activeIndex - 1 + slides.length) % slides.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, slides.length, onChangeIndex]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-label={current?.title || 'Media viewer'}
      className="media-lightbox m-auto max-w-5xl w-[94vw] max-h-[92vh] bg-transparent p-0 border-0 outline-none overflow-visible"
    >
      {current && activeIndex !== null && (
        <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header bar */}
          <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/95">
            <div className="min-w-0 flex items-center gap-3">
              {current.badge && (
                <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-500/20 text-primary-200 border border-primary-400/30">
                  {current.badge}
                </span>
              )}
              <p className="text-sm font-semibold text-white truncate">{current.title}</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {slides.length > 1 && (
                <span className="text-xs font-medium text-slate-400 tabular-nums">
                  {activeIndex + 1} / {slides.length}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close viewer"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Image Stage */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center bg-black/70 p-3 sm:p-6">
            <img
              src={current.image}
              alt={current.title}
              decoding="async"
              className="max-h-[72vh] max-w-full w-auto h-auto object-contain rounded-lg select-none"
            />

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => onChangeIndex((activeIndex - 1 + slides.length) % slides.length)}
                  aria-label="Previous image"
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeIndex((activeIndex + 1) % slides.length)}
                  aria-label="Next image"
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {current.subtitle && (
            <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/95">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{current.subtitle}</p>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
};

export default MediaLightbox;
