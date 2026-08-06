import { useEffect, useState } from 'react';
import axios from 'axios';
import apiConfig from '../config/api';

interface Stats {
  total: number;
  pending: number;
  published: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, published: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(apiConfig.endpoints.articles);
        const articles = response.data.articles || response.data || [];

        const total = articles.length;
        const pending = articles.filter((a: any) => a.status === 'IN_MODERATION' || a.status === 'IN_APPROVAL').length;
        const published = articles.filter((a: any) => a.status === 'PUBLISHED').length;

        setStats({ total, pending, published });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
        <p className="text-gray-600">Welcome to infinithoughts Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Articles</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{loading ? '—' : stats.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total articles</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Pending Review</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{loading ? '—' : stats.pending}</p>
          <p className="text-sm text-gray-500 mt-1">Waiting for approval</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Published</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{loading ? '—' : stats.published}</p>
          <p className="text-sm text-gray-500 mt-1">Live articles</p>
        </div>
      </div>
    </div>
  );
}
