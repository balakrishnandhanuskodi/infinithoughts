import { Link } from 'react-router-dom';

export default function ArticleList() {
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
        <p className="text-gray-600">No articles yet. Create one to get started!</p>
      </div>
    </div>
  );
}
