import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FlipbookViewer } from '../components/FlipbookViewer';
import { apiConfig } from '../config/api';

interface Issue {
  id: string;
  issue_number: number;
  month?: string;
  year: number;
  total_pages: number;
  pdf_status: string;
}

interface FlipbookPage {
  id: string;
  page_number: number;
  thumbnail_url?: string;
  mobile_url?: string;
  desktop_url?: string;
  storage_path?: string;
}

export const FlipbookPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [pages, setPages] = useState<FlipbookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIssueData();
  }, [issueId]);

  const fetchIssueData = async () => {
    if (!issueId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch issue details - TODO: implement this endpoint
      // const issueResponse = await axios.get(`${apiConfig.baseURL}/admin/issues/${issueId}`);
      // setIssue(issueResponse.data);

      // Fetch flipbook pages
      const pagesResponse = await axios.get(
        `${apiConfig.baseURL}/admin/issues/upload/${issueId}/pages`
      );
      setPages(pagesResponse.data.pages || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load flipbook');
      console.error('Error fetching flipbook data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>📖 Loading flipbook...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={styles.error}>❌ {error}</div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={styles.emptyState}>
          <p>📖 No pages available for this issue</p>
          <p>The PDF is still being processed. Please try again in a moment.</p>
        </div>
      </div>
    );
  }

  const title = issue
    ? `Issue #${issue.issue_number}${issue.month ? ` - ${issue.month}` : ''} ${issue.year}`
    : 'Magazine Flipbook';

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        ← Back to Issues
      </button>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{pages.length} pages available</p>
        </div>
      </div>

      <FlipbookViewer issueId={issueId || ''} pages={pages} title={title} />

      <div style={styles.footer}>
        <p style={styles.footerText}>
          💡 Use arrow buttons to navigate, zoom controls to adjust size, or click thumbnail to jump to page
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  } as React.CSSProperties,
  backButton: {
    alignSelf: 'flex-start',
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '80px 24px',
    fontSize: '18px',
    color: '#666',
  } as React.CSSProperties,
  error: {
    padding: '16px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    fontSize: '14px',
  } as React.CSSProperties,
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '80px 24px',
    color: '#999',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#333',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  } as React.CSSProperties,
  footer: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    textAlign: 'center',
  } as React.CSSProperties,
  footerText: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  } as React.CSSProperties,
};
