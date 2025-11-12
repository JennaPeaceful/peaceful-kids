import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { InlineLoadingState } from './LoadingState';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

// Configure PDF.js worker using CDN (Vite-compatible)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
  fileUrl: string;
  imageUrl?: string;
  title?: string;
}

const PdfRenderer: React.FC<PdfRendererProps> = ({ fileUrl, imageUrl, title }) => {
  const isNative = Capacitor.isNativePlatform();

  // State for PDF rendering (used by all platforms now)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(800);
  const [numPages, setNumPages] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Debug: Log render
  console.log('[PdfRenderer] Rendering:', { isNative, fileUrl, imageUrl, title });

  // If we have a pre-converted image, show that instead of trying to render PDF
  if (imageUrl) {
    console.log('[PdfRenderer] Using pre-converted image:', imageUrl);

    // Handler to open PDF externally
    const handleOpenExternal = async () => {
      console.log('[PdfRenderer] Open PDF button clicked');
      try {
        await FileOpener.openFile({
          path: fileUrl,
          mimeType: 'application/pdf',
        });
      } catch (error) {
        console.error('Error opening PDF with FileOpener:', error);
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div className="w-full flex flex-col gap-4">
        {/* Image displayed inline */}
        <img
          src={imageUrl}
          alt={title || 'PDF Document'}
          className="w-full rounded-lg shadow-lg"
          onError={(e) => {
            console.error('[PdfRenderer] Image failed to load:', imageUrl);
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Button BELOW image */}
        <div className="flex justify-center">
          <Button
            onClick={handleOpenExternal}
            className="flex items-center gap-2 bg-gradient-to-r from-primary via-secondary to-accent text-white hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-4 h-4" />
            Open in PDF Viewer
          </Button>
        </div>
      </div>
    );
  }

  // Observe container width for responsive pages
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setWidth(Math.min(el.clientWidth || 800, 1200));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onDocLoad = ({ numPages: nextNumPages }: { numPages: number }) => {
    console.log('[PdfRenderer] ✅ Document loaded successfully:', {
      numPages: nextNumPages,
      fileUrl,
      isNative,
      workerSrc: pdfjs.GlobalWorkerOptions.workerSrc
    });
    setNumPages(nextNumPages);
    setIsLoading(false);
  };

  const onDocError = (err: Error) => {
    console.error('[PdfRenderer] ❌ Document load error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      fileUrl,
      isNative,
      workerSrc: pdfjs.GlobalWorkerOptions.workerSrc,
      fullError: err
    });
    setLoadError(err.message || 'Failed to load PDF');
    setIsLoading(false);
  };

  const onPageRenderError = (pageNum: number) => (err: Error) => {
    console.error('[PdfRenderer] ❌ Page render error:', {
      pageNumber: pageNum,
      message: err.message,
      name: err.name,
      stack: err.stack,
      fullError: err
    });
  };

  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages]);

  // Handler to open PDF externally (for native platforms)
  const handleOpenExternal = async () => {
    console.log('[PdfRenderer] Open PDF button clicked');
    try {
      // Try to open with system PDF viewer
      await FileOpener.openFile({
        path: fileUrl,
        mimeType: 'application/pdf',
      });
    } catch (error) {
      console.error('Error opening PDF with FileOpener:', error);
      // Fallback to opening in browser
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Log initial render info
  useEffect(() => {
    console.log('[PdfRenderer] 🚀 Component mounted/updated:', {
      fileUrl,
      isNative,
      workerSrc: pdfjs.GlobalWorkerOptions.workerSrc,
      pdfjsVersion: pdfjs.version
    });
  }, [fileUrl, isNative]);

  return (
    <div className="w-full">
      {/* Native platform: Show button to open in system viewer */}
      {isNative && (
        <div className="flex flex-col items-center justify-center py-6 px-4 mb-4">
          <Button
            onClick={handleOpenExternal}
            className="flex items-center gap-2 bg-gradient-to-r from-primary via-secondary to-accent text-white hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-4 h-4" />
            Open in PDF Viewer
          </Button>
        </div>
      )}

      {/* Inline PDF display for all platforms */}
      <div ref={containerRef} className="w-full">
        {isLoading && (
          <div className="flex justify-center py-8">
            <InlineLoadingState message="Loading document..." />
          </div>
        )}

        {loadError ? (
          <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
            {title ? `${title}: ` : ''}Unable to display PDF inline. {isNative ? 'Use the button above to open it in your PDF viewer.' : 'You can open it in a new tab.'}
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocLoad}
            onLoadError={onDocError}
            onSourceSuccess={() => console.log('[PdfRenderer] 📄 PDF source loaded')}
            onSourceError={(err) => console.error('[PdfRenderer] ❌ PDF source error:', err)}
            loading={null}
          >
            <div className="flex flex-col gap-6">
              {pages.map((pageNumber) => (
                <div key={pageNumber} className="mx-auto w-full">
                  <Page
                    pageNumber={pageNumber}
                    width={width}
                    renderMode={isNative ? "svg" : "canvas"}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onRenderSuccess={() => console.log(`[PdfRenderer] ✅ Page ${pageNumber} rendered`)}
                    onRenderError={onPageRenderError(pageNumber)}
                  />
                </div>
              ))}
            </div>
          </Document>
        )}
      </div>
    </div>
  );
};

export default PdfRenderer;
