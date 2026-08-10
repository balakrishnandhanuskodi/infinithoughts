import React, { useState } from 'react';
import axios from 'axios';
import { apiConfig } from '../config/api';

interface PDFUploadFormProps {
  onUploadSuccess?: (issue: any) => void;
  onUploadError?: (error: string) => void;
}

export const PDFUploadForm: React.FC<PDFUploadFormProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [formData, setFormData] = useState({
    issue_number: '',
    month: '',
    year: new Date().getFullYear().toString(),
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        setFile(null);
        return;
      }
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('File size must be less than 15MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!formData.issue_number) {
      setError('Please enter an issue number');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('pdf', file);
    uploadFormData.append('issue_number', formData.issue_number);
    uploadFormData.append('month', formData.month);
    uploadFormData.append('year', formData.year);

    setUploading(true);
    setProgress(0);

    try {
      const response = await axios.post(
        `${apiConfig.baseURL}/admin/issues/upload`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgress(percentCompleted);
          },
        }
      );

      setSuccess(true);
      setFile(null);
      setFormData({
        issue_number: '',
        month: '',
        year: new Date().getFullYear().toString(),
      });

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      // Reset form after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Upload failed';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Magazine PDF</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Issue Number */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Issue Number *</label>
          <input
            type="number"
            name="issue_number"
            value={formData.issue_number}
            onChange={handleInputChange}
            placeholder="e.g., 1, 2, 3..."
            disabled={uploading}
            style={styles.input}
            required
          />
        </div>

        {/* Month */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Month</label>
          <input
            type="text"
            name="month"
            value={formData.month}
            onChange={handleInputChange}
            placeholder="e.g., January, February..."
            disabled={uploading}
            style={styles.input}
          />
        </div>

        {/* Year */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Year *</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            min="2000"
            max="2100"
            disabled={uploading}
            style={styles.input}
            required
          />
        </div>

        {/* File Upload */}
        <div style={styles.formGroup}>
          <label style={styles.label}>PDF File *</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            style={styles.input}
            required
          />
          {file && <p style={styles.fileName}>📄 {file.name}</p>}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                }}
              />
            </div>
            <p style={styles.progressText}>{progress}% uploaded</p>
          </div>
        )}

        {/* Error Message */}
        {error && <div style={styles.error}>❌ {error}</div>}

        {/* Success Message */}
        {success && (
          <div style={styles.success}>
            ✅ PDF uploaded successfully! {file?.name} processed with{' '}
            <strong>multiple pages</strong> ready for flipbook viewer.
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !file || !formData.issue_number}
          style={{
            ...styles.button,
            opacity: uploading || !file || !formData.issue_number ? 0.6 : 1,
            cursor: uploading || !file || !formData.issue_number ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? `Uploading ${progress}%...` : 'Upload PDF'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  } as React.CSSProperties,
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#333',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  } as React.CSSProperties,
  input: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  fileName: {
    fontSize: '13px',
    color: '#666',
    margin: '4px 0 0 0',
  } as React.CSSProperties,
  progressContainer: {
    marginTop: '8px',
  } as React.CSSProperties,
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  } as React.CSSProperties,
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.3s ease',
  } as React.CSSProperties,
  progressText: {
    fontSize: '12px',
    color: '#666',
    margin: '8px 0 0 0',
  } as React.CSSProperties,
  error: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    fontSize: '14px',
  } as React.CSSProperties,
  success: {
    padding: '12px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '4px',
    fontSize: '14px',
  } as React.CSSProperties,
  button: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    marginTop: '8px',
  } as React.CSSProperties,
};
