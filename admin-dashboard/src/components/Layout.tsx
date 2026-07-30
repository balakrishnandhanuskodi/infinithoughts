import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">infinithoughts</h1>
          <p className="text-sm text-gray-600">Admin Dashboard</p>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          <Link
            to="/"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Dashboard
          </Link>
          <Link
            to="/articles"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Articles
          </Link>
          <Link
            to="/articles/new"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            New Article
          </Link>
          <Link
            to="/issues"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Issues
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
