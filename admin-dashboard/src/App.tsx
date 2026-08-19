import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ArticleList from './pages/ArticleList';
import ArticleEditor from './pages/ArticleEditor';
import IssueManagement from './pages/IssueManagement';
import { FlipbookPage } from './pages/FlipbookPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/articles" element={<ArticleList />} />
          <Route path="/articles/:id" element={<ArticleEditor />} />
          <Route path="/articles/new" element={<ArticleEditor />} />
          <Route path="/issues" element={<IssueManagement />} />
          <Route path="/issues/:issueId/flipbook" element={<FlipbookPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
