import React, { useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  alt = 'Image'
}) => {
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[101] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="w-8 h-8 text-white" />
      </button>

      {/* Hint text */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-[101] pointer-events-none">
        <p className="text-white/60 text-sm">Pinch or double-tap to zoom</p>
      </div>

      {/* Zoomable image container */}
      <div
        className="w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit
          doubleClick={{ mode: 'toggle', step: 2 }}
          pinch={{ step: 5 }}
          wheel={{ step: 0.1 }}
        >
          {({ resetTransform }) => (
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full !flex !items-center !justify-center"
            >
              <img
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-full object-contain"
                onLoad={() => resetTransform()}
              />
            </TransformComponent>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
};

export default ImageLightbox;
