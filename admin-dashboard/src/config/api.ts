const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    articles: `${API_BASE_URL}/articles`,
    admin: `${API_BASE_URL}/admin`,
    health: `${API_BASE_URL.replace('/api', '')}/health`,
  },
};

export default apiConfig;
