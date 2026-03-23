import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import ToolPage from './pages/ToolPage';
import './index.css';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tool/:id" element={<ToolPage />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}
