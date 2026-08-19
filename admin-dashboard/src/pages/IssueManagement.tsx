import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PDFUploadForm } from '../components/PDFUploadForm';
import { apiConfig } from '../config/api';

interface Issue {
  id: string;
  issue_number: number;
  month?: string;
  year: number;
  total_pages?: number;
  pdf_status: string;
  created_at: string;
}

export default function IssueManagement() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${apiConfig.baseURL}/admin/issues`);
      setIssues(response.data.issues || []);
    } catch (err: any) {
      console.error('Error fetching issues:', err);
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
  };

  const handleViewFlipbook = (issueId: string) => {
    navigate(`/issues/${issueId}/flipbook`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📚 Issue Management</h2>

      {/* PDF Upload Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <PDFUploadForm onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Uploaded Issues List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Issues</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading issues...</p>
        ) : issues.length === 0 ? (
          <p className="text-gray-600">No issues uploaded yet. Upload a PDF above to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-800">
                    Issue #{issue.issue_number}
                    {issue.month && ` - ${issue.month}`} {issue.year}
                  </h4>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded text-white ${
                      issue.pdf_status === 'COMPLETED'
                        ? 'bg-green-500'
                        : issue.pdf_status === 'PROCESSING'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  >
                    {issue.pdf_status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Pages:</strong> {issue.total_pages || 'Processing...'}
                  </p>
                  <p>
                    <strong>Uploaded:</strong> {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                </div>
                {issue.pdf_status === 'COMPLETED' && (
                  <button
                    onClick={() => handleViewFlipbook(issue.id)}
                    className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    📖 View Flipbook
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Issue Upload Workflow:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Upload PDF magazine (5MB max)</li>
          <li>Backend extracts pages automatically</li>
          <li>Pages stored in Supabase Storage</li>
          <li>Metadata saved to PostgreSQL</li>
          <li>Ready for flipbook viewer</li>
        </ul>
      </div>
    </div>
  );
}
