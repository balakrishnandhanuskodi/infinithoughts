import { useState } from 'react';
import { useParams } from 'react-router-dom';
import EditableElement from '../components/XMLEditor/EditableElement';
import FormattingToolbar from '../components/XMLEditor/FormattingToolbar';
import { serializeArticleToXML } from '../utils/xmlSerializer';

export default function ArticleEditor() {
  const { id } = useParams();
  const isNewArticle = !id;

  const [article, setArticle] = useState({
    id: 'article-' + Date.now(),
    metadata: {
      title: '',
      slug: '',
      excerpt: '',
      author: { anonymous: true },
      issue: {
        issue_id: '',
        issue_number: 0,
        month: '',
        year: new Date().getFullYear(),
      },
      publication_date: new Date().toISOString(),
      theme: '',
    },
    content: [
      { heading: { level: 1, _: 'Article Title' } },
      { paragraph: 'Start typing your article content here...' },
    ],
    tags: { tag: [] },
  });

  const [xmlOutput, setXmlOutput] = useState('');
  const [showXML, setShowXML] = useState(false);

  const handleMetadataChange = (field: string, value: any) => {
    setArticle({
      ...article,
      metadata: {
        ...article.metadata,
        [field]: value,
      },
    });
  };

  const handleContentChange = (index: number, newContent: any) => {
    const newContentArray = [...article.content];
    newContentArray[index] = newContent;
    setArticle({ ...article, content: newContentArray });
  };

  const handleDeleteElement = (index: number) => {
    setArticle({
      ...article,
      content: article.content.filter((_: any, i: number) => i !== index),
    });
  };

  const handleAddElement = (type: string) => {
    const newElement: any = {};
    switch (type) {
      case 'heading':
        newElement.heading = { level: 2, _: 'New Heading' };
        break;
      case 'paragraph':
        newElement.paragraph = 'New paragraph...';
        break;
      case 'pull_quote':
        newElement.pull_quote = {
          quote: 'Add quote here',
          attribution: 'Attribution',
        };
        break;
      default:
        return;
    }
    setArticle({
      ...article,
      content: [...article.content, newElement],
    });
  };

  const handleSaveArticle = () => {
    const xml = serializeArticleToXML(article);
    setXmlOutput(xml);
    setShowXML(true);

    // TODO: Send to backend API
    console.log('Article XML:', xml);
    alert('Article saved! Check console for XML output.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {isNewArticle ? 'New Article' : `Edit Article: ${article.metadata.title}`}
        </h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowXML(!showXML)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            {showXML ? 'Hide' : 'Show'} XML
          </button>
          <button
            onClick={handleSaveArticle}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Article
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* XML Output (if visible) */}
        {showXML && (
          <div className="lg:col-span-1 bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96">
            <pre>{xmlOutput || 'Generate XML by saving article...'}</pre>
          </div>
        )}

        {/* Main Editor */}
        <div className={showXML ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {/* Metadata Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Article Metadata</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={article.metadata.title}
                  onChange={(e) => handleMetadataChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={article.metadata.slug}
                  onChange={(e) => handleMetadataChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="article-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label>
                <textarea
                  value={article.metadata.excerpt}
                  onChange={(e) => handleMetadataChange('excerpt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief article excerpt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <input
                  type="text"
                  value={article.metadata.theme}
                  onChange={(e) => handleMetadataChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="destiny, psychology, spirituality..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue ID *</label>
                  <input
                    type="text"
                    value={article.metadata.issue.issue_id}
                    onChange={(e) =>
                      handleMetadataChange('issue', {
                        ...article.metadata.issue,
                        issue_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="issue-202311"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Number</label>
                  <input
                    type="number"
                    value={article.metadata.issue.issue_number}
                    onChange={(e) =>
                      handleMetadataChange('issue', {
                        ...article.metadata.issue,
                        issue_number: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Content</h3>
              <div className="space-x-2">
                <button
                  onClick={() => handleAddElement('heading')}
                  className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  + Heading
                </button>
                <button
                  onClick={() => handleAddElement('paragraph')}
                  className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  + Paragraph
                </button>
                <button
                  onClick={() => handleAddElement('pull_quote')}
                  className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  + Quote
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {article.content.map((element: any, index: number) => (
                <EditableElement
                  key={index}
                  type={
                    element.heading ? 'heading' : element.paragraph ? 'paragraph' : element.pull_quote ? 'pull_quote' : 'blockquote'
                  }
                  content={element}
                  onChange={(newContent) => handleContentChange(index, newContent)}
                  onDelete={() => handleDeleteElement(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
