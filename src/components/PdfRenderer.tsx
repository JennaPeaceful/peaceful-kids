import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { InlineLoadingState } from './LoadingState';

// Configure PDF.js worker using CDN (Vite-compatible)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
  fileUrl: string;
  title?: string;
}

const PdfRenderer: React.FC<PdfRendererProps> = ({ fileUrl, title }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(800);
  const [numPages, setNumPages] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    setNumPages(nextNumPages);
    setIsLoading(false);
  };

  const onDocError = (err: Error) => {
    setLoadError(err.message || 'Failed to load PDF');
    setIsLoading(false);
  };

  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages]);

  return (
    <div ref={containerRef} className="w-full">
      {isLoading && (
        <div className="flex justify-center py-8">
          <InlineLoadingState message="Loading document..." />
        </div>
      )}

      {loadError ? (
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          {title ? `${title}: ` : ''}Unable to display PDF here. You can open it in a new tab.
        </div>
      ) : (
        <Document file={fileUrl} onLoadSuccess={onDocLoad} onLoadError={onDocError} loading={null}>
          <div className="flex flex-col gap-6">
            {pages.map((pageNumber) => (
              <div key={pageNumber} className="mx-auto w-full">
                <Page
                  pageNumber={pageNumber}
                  width={width}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </div>
        </Document>
      )}
    </div>
  );
};

export default PdfRenderer;
