import React, { useState, useEffect } from 'react';

interface FlipbookPage {
  id: string;
  page_number: number;
  thumbnail_url?: string;
  mobile_url?: string;
  desktop_url?: string;
  storage_path?: string;
}

interface FlipbookViewerProps {
  issueId: string;
  pages: FlipbookPage[];
  title?: string;
}

export const FlipbookViewer: React.FC<FlipbookViewerProps> = ({
  issueId,
  pages,
  title = 'Magazine Flipbook',
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalPages = pages.length;
  const currentPageData = pages[currentPage];

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev + 10));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(50, prev - 10));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePageJump = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10) - 1;
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  if (!currentPageData) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p>📖 No pages available</p>
        </div>
      </div>
    );
  }

  // Use desktop_url if available, else mobile_url, else storage_path
  const pageImageUrl = currentPageData.desktop_url || currentPageData.mobile_url || currentPageData.storage_path;

  return (
    <div style={{ ...styles.container, ...(isFullscreen ? styles.fullscreen : {}) }}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        <div style={styles.controls}>
          <button
            style={styles.controlButton}
            onClick={handleZoomOut}
            title="Zoom out"
            disabled={zoom <= 50}
          >
            🔍−
          </button>
          <input
            type="text"
            value={`${zoom}%`}
            readOnly
            style={styles.zoomDisplay}
            onClick={handleResetZoom}
            title="Click to reset zoom"
          />
          <button
            style={styles.controlButton}
            onClick={handleZoomIn}
            title="Zoom in"
            disabled={zoom >= 200}
          >
            🔍+
          </button>
          <button
            style={styles.controlButton}
            onClick={handleFullscreen}
            title="Fullscreen"
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{ ...styles.canvasContainer, height: isFullscreen ? 'calc(100vh - 160px)' : '600px' }}>
        {loading && <div style={styles.loading}>Loading page...</div>}

        {pageImageUrl ? (
          <img
            src={pageImageUrl}
            alt={`Page ${currentPage + 1}`}
            style={{
              ...styles.pageImage,
              width: `${zoom}%`,
              height: 'auto',
              objectFit: 'contain',
            }}
            onLoad={() => setLoading(false)}
            onLoadStart={() => setLoading(true)}
          />
        ) : (
          <div style={styles.placeholderPage}>
            <p>📄 Page {currentPage + 1}</p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              {pageImageUrl ? 'Loading...' : 'No image available'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div style={styles.footer}>
        <div style={styles.navigation}>
          <button
            style={styles.navButton}
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>

          <div style={styles.pageIndicator}>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage + 1}
              onChange={handlePageJump}
              style={styles.pageInput}
            />
            <span style={styles.pageCount}> / {totalPages}</span>
          </div>

          <button
            style={styles.navButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            Next →
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div style={styles.thumbnailStrip}>
          {pages.map((page, index) => (
            <button
              key={page.id}
              style={{
                ...styles.thumbnail,
                border: currentPage === index ? '3px solid #2196F3' : '1px solid #ccc',
                opacity: currentPage === index ? 1 : 0.6,
              }}
              onClick={() => setCurrentPage(index)}
              title={`Go to page ${index + 1}`}
            >
              <img
                src={page.thumbnail_url || page.mobile_url || page.storage_path || ''}
                alt={`Thumbnail ${index + 1}`}
                style={styles.thumbnailImage}
              />
              <span style={styles.thumbnailLabel}>{index + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  fullscreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    borderRadius: 0,
    zIndex: 9999,
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#333',
    color: 'white',
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
  } as React.CSSProperties,
  controls: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  } as React.CSSProperties,
  controlButton: {
    padding: '6px 10px',
    fontSize: '12px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  zoomDisplay: {
    padding: '4px 8px',
    fontSize: '12px',
    width: '50px',
    textAlign: 'center',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  canvasContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f0f0f0',
    overflowY: 'auto',
    position: 'relative',
  } as React.CSSProperties,
  pageImage: {
    maxHeight: '100%',
    cursor: 'grab',
  } as React.CSSProperties,
  placeholderPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '400px',
    height: '500px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    color: '#666',
  } as React.CSSProperties,
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '16px 24px',
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: 'white',
    borderRadius: '4px',
  } as React.CSSProperties,
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px',
    color: '#999',
  } as React.CSSProperties,
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
  } as React.CSSProperties,
  navigation: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,
  navButton: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  pageIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    color: '#666',
  } as React.CSSProperties,
  pageInput: {
    width: '50px',
    padding: '6px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    textAlign: 'center',
  } as React.CSSProperties,
  pageCount: {
    color: '#999',
  } as React.CSSProperties,
  thumbnailStrip: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  } as React.CSSProperties,
  thumbnail: {
    flexShrink: 0,
    width: '60px',
    height: '80px',
    padding: '4px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    overflow: 'hidden',
  } as React.CSSProperties,
  thumbnailImage: {
    width: '100%',
    height: '70px',
    objectFit: 'cover',
  } as React.CSSProperties,
  thumbnailLabel: {
    display: 'block',
    fontSize: '10px',
    textAlign: 'center',
    color: '#666',
  } as React.CSSProperties,
};
