export default function IssueManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Issue Management</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Upload New Issue (PDF)
          </button>
        </div>

        <p className="text-gray-600">No issues uploaded yet.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Issue Upload Workflow:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Upload PDF issue</li>
          <li>Backend converts PDF to flipbook pages</li>
          <li>Pages stored on AWS S3</li>
          <li>Metadata saved to PostgreSQL</li>
          <li>Ready for flipbook viewer</li>
        </ul>
      </div>
    </div>
  );
}
