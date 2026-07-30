export default function ArticleEditor() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Editor (WYSIWYG)</h2>
      <p className="text-gray-600">Article editor with XML support coming soon...</p>

      <div className="mt-8 p-4 bg-gray-100 rounded border border-gray-300">
        <p className="text-gray-700 font-mono text-sm">
          WYSIWYG Editor Component<br/>
          - Heading editor<br/>
          - Paragraph editor with formatting<br/>
          - Pull quote editor<br/>
          - Image uploader<br/>
          - Direct XML serialization
        </p>
      </div>
    </div>
  );
}
