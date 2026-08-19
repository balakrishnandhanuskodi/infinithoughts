import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiConfig } from '../config/api';

interface PageStatus {
  page_number: number;
  status: 'pending' | 'extracting' | 'extracted' | 'failed';
  error?: string;
}

interface ProgressData {
  issue_id: string;
  total_pages: number;
  extracted_pages: number;
  failed_pages: number;
  extracting_pages: number;
  pending_pages: number;
  extraction_status: string;
  pages: PageStatus[];
}

interface ExtractionProgressProps {
  issueId: string;
  visible: boolean;
  onExtractionComplete?: () => void;
}

export const ExtractionProgress: React.FC<ExtractionProgressProps> = ({
  issueId,
  visible,
  onExtractionComplete,
}) => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!visible || !issueId) return;

    const fetchProgress = async () => {
      try {
        const response = await axios.get(
          `${apiConfig.baseURL}/admin/issues/${issueId}/progress`
        );
        setProgress(response.data);

        // Check if still extracting
        const stillExtracting =
          response.data.extracted_pages + response.data.failed_pages < response.data.total_pages;
        setIsExtracting(stillExtracting);

        // Trigger completion callback once
        if (!stillExtracting && !hasCompleted) {
          setHasCompleted(true);
          if (onExtractionComplete) {
            onExtractionComplete();
          }
        }

        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch progress';
        setError(errorMessage);
      }
    };

    // Initial fetch
    fetchProgress();

    // Poll every 1 second if still extracting
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isExtracting) {
      interval = setInterval(fetchProgress, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [issueId, visible, isExtracting, hasCompleted, onExtractionComplete]);

  if (!visible || !progress) {
    return null;
  }

  const totalPages = progress.total_pages;
  const extractedPages = progress.extracted_pages;
  const failedPages = progress.failed_pages;
  const extractingPages = progress.extracting_pages;
  const pendingPages = progress.pending_pages;

  const completionPercent = totalPages > 0 ? Math.round((extractedPages / totalPages) * 100) : 0;
  const failurePercent = totalPages > 0 ? Math.round((failedPages / totalPages) * 100) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📊 Page Extraction Progress</h3>
        {isExtracting && <span style={styles.extractingBadge}>⏳ Extracting...</span>}
      </div>

      {/* Overall Progress Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{extractedPages}</div>
          <div style={styles.statLabel}>Extracted</div>
        </div>
        <div style={{ ...styles.statBox, backgroundColor: '#fff3e0' }}>
          <div style={styles.statValue}>{extractingPages}</div>
          <div style={styles.statLabel}>Extracting</div>
        </div>
        <div style={{ ...styles.statBox, backgroundColor: '#ffebee' }}>
          <div style={styles.statValue}>{failedPages}</div>
          <div style={styles.statLabel}>Failed</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{pendingPages}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>
          Overall: {extractedPages}/{totalPages} pages
        </div>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${completionPercent}%`,
              backgroundColor: failurePercent > 0 ? '#FF9800' : '#4CAF50',
            }}
          />
        </div>
        <div style={styles.progressPercent}>{completionPercent}% complete</div>
      </div>

      {/* Error Message */}
      {error && <div style={styles.errorMessage}>❌ {error}</div>}

      {/* Pages Grid */}
      <div style={styles.pagesContainer}>
        <div style={styles.pagesLabel}>Page Details</div>
        <div style={styles.pagesGrid}>
          {progress.pages.map((page) => (
            <div
              key={page.page_number}
              style={{
                ...styles.pageItem,
                backgroundColor:
                  page.status === 'extracted'
                    ? '#e8f5e9'
                    : page.status === 'failed'
                      ? '#ffebee'
                      : page.status === 'extracting'
                        ? '#e3f2fd'
                        : '#f5f5f5',
                borderColor:
                  page.status === 'extracted'
                    ? '#4CAF50'
                    : page.status === 'failed'
                      ? '#f44336'
                      : page.status === 'extracting'
                        ? '#2196F3'
                        : '#ccc',
              }}
            >
              <div style={styles.pageNumber}>Page {page.page_number}</div>
              <div style={styles.pageStatus}>
                {page.status === 'extracted' && '✅'}
                {page.status === 'extracting' && '⏳'}
                {page.status === 'failed' && '❌'}
                {page.status === 'pending' && '⚪'}
              </div>
              {page.error && (
                <div style={styles.pageError} title={page.error}>
                  {page.error.substring(0, 30)}...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Failed Pages Details */}
      {failedPages > 0 && (
        <div style={styles.failedPagesSection}>
          <div style={styles.failedPagesTitle}>Failed Pages</div>
          {progress.pages
            .filter((p) => p.status === 'failed')
            .map((page) => (
              <div key={page.page_number} style={styles.failedPageItem}>
                <span style={styles.failedPageNum}>Page {page.page_number}:</span>
                <span style={styles.failedPageError}>{page.error || 'Unknown error'}</span>
              </div>
            ))}
        </div>
      )}

      {/* Completion Message */}
      {!isExtracting && extractedPages > 0 && (
        <div style={styles.completionMessage}>
          ✅ Extraction complete! {extractedPages}/{totalPages} pages successfully processed
          {failedPages > 0 && ` (${failedPages} pages failed)`}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#fafafa',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    marginTop: '16px',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  } as React.CSSProperties,
  extractingBadge: {
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  } as React.CSSProperties,
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  } as React.CSSProperties,
  statBox: {
    backgroundColor: '#e8f5e9',
    padding: '12px',
    borderRadius: '6px',
    textAlign: 'center',
    border: '1px solid #c8e6c9',
  } as React.CSSProperties,
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2e7d32',
  } as React.CSSProperties,
  statLabel: {
    fontSize: '12px',
    color: '#558b2f',
    marginTop: '4px',
  } as React.CSSProperties,
  progressSection: {
    marginBottom: '16px',
  } as React.CSSProperties,
  progressLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#666',
    marginBottom: '8px',
  } as React.CSSProperties,
  progressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#e0e0e0',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '4px',
  } as React.CSSProperties,
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  } as React.CSSProperties,
  progressPercent: {
    fontSize: '12px',
    color: '#999',
  } as React.CSSProperties,
  errorMessage: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    fontSize: '13px',
    marginBottom: '12px',
  } as React.CSSProperties,
  pagesContainer: {
    marginBottom: '16px',
  } as React.CSSProperties,
  pagesLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#666',
    marginBottom: '8px',
  } as React.CSSProperties,
  pagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
    gap: '8px',
  } as React.CSSProperties,
  pageItem: {
    padding: '8px',
    borderRadius: '4px',
    border: '2px solid',
    textAlign: 'center',
    fontSize: '12px',
  } as React.CSSProperties,
  pageNumber: {
    fontWeight: '500',
    fontSize: '11px',
    color: '#666',
  } as React.CSSProperties,
  pageStatus: {
    fontSize: '16px',
    margin: '4px 0',
  } as React.CSSProperties,
  pageError: {
    fontSize: '9px',
    color: '#d32f2f',
    marginTop: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  failedPagesSection: {
    padding: '12px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    marginBottom: '12px',
    border: '1px solid #ffcdd2',
  } as React.CSSProperties,
  failedPagesTitle: {
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: '8px',
    fontSize: '13px',
  } as React.CSSProperties,
  failedPageItem: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '12px',
    marginBottom: '6px',
    paddingBottom: '6px',
    borderBottom: '1px solid #ffcdd2',
  } as React.CSSProperties,
  failedPageNum: {
    fontWeight: '500',
    color: '#d32f2f',
  } as React.CSSProperties,
  failedPageError: {
    color: '#c62828',
    fontSize: '11px',
    marginTop: '2px',
    wordBreak: 'break-word',
  } as React.CSSProperties,
  completionMessage: {
    padding: '12px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '4px',
    fontSize: '13px',
    border: '1px solid #c8e6c9',
  } as React.CSSProperties,
};
