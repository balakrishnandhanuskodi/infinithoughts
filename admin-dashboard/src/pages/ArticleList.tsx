import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import apiConfig from '../config/api';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  theme?: string;
  reading_time_minutes?: number;
  created_at: string;
}

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiConfig.endpoints.articles);
        if (response.data.articles) {
          setArticles(response.data.articles);
        } else if (Array.isArray(response.data)) {
          setArticles(response.data);
        }
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch articles');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Articles</h2>
        <Link
          to="/articles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          New Article
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading && <p className="text-gray-600">Loading articles...</p>}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error loading articles</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">API URL: {apiConfig.endpoints.articles}</p>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <p className="text-gray-600">No articles yet. Create one to get started!</p>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Theme</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reading Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{article.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        article.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{article.theme || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{article.reading_time_minutes ? `${article.reading_time_minutes} min` : '—'}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Link
                        to={`/articles/${article.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
