import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Sun, Moon } from 'lucide-react';

import Collection from './components/Collection';
import Practice from './components/Practice';
import Chatbot from './components/Chatbot';
import Progress from './components/Progress';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import AddDrawer from './components/AddDrawer';
import QADetail from './components/QADetail';
import Docs from './components/Docs';
import ResumeHub from './components/ResumeHub';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { CollectionProvider } from './contexts/CollectionContext';
import { API_BASE } from './lib/api';

// Set up Axios Interceptor to add Auth Token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function AppShell({ showToast }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      showToast('Generating study guide…');
      const res = await axios.get(`${API_BASE}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'PrepAI_Study_Guide.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Download complete');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Download failed');
    }
  };

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '236px minmax(0,1fr)',
          height: '100vh',
          padding: 14,
          gap: 14,
          boxSizing: 'border-box',
        }}
      >
        <Sidebar
          API_BASE={API_BASE}
          handleDownloadPDF={handleDownloadPDF}
          showToast={showToast}
        />

        {/* Main sheet */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 28,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: 18, right: 22, display: 'flex', gap: 8, zIndex: 5 }}>
            <button
              onClick={toggleTheme}
              className="btn btn-ghost"
              title="Toggle dark mode"
              style={{
                width: 40,
                height: 40,
                padding: 0,
                justifyContent: 'center',
                color: 'var(--color-text)',
                background: 'var(--color-bg)',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn btn-primary"
              style={{ minHeight: 40 }}
            >
              <Plus size={15} /> Add Q&amp;A
            </button>
          </div>

          <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Routes>
              <Route path="/collection" element={<Collection onAddClick={() => setDrawerOpen(true)} />} />
              <Route path="/practice" element={<Practice API_BASE={API_BASE} showToast={showToast} />} />
              <Route path="/chat" element={<Chatbot API_BASE={API_BASE} showToast={showToast} />} />
              <Route path="/resume" element={<ResumeHub API_BASE={API_BASE} showToast={showToast} />} />
              <Route path="/progress" element={<Progress API_BASE={API_BASE} showToast={showToast} />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="*" element={<Navigate to="/collection" replace />} />
            </Routes>
          </main>
        </div>
      </div>

      <QADetail showToast={showToast} />

      {user && (
        <AddDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          API_BASE={API_BASE}
          showToast={showToast}
        />
      )}
    </>
  );
}

function Toast({ message }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: 'var(--color-text)',
        color: 'var(--color-bg)',
        padding: '12px 20px',
        borderRadius: 999,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: 'var(--shadow-lg)',
        animation: 'toastIn .25s ease',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
      {message}
    </div>
  );
}

function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SessionProvider API_BASE={API_BASE}>
            <CollectionProvider API_BASE={API_BASE} showToast={showToast}>
              <Routes>
                <Route path="/login" element={<Login showToast={showToast} />} />
                <Route path="/signup" element={<Signup showToast={showToast} />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <AppShell showToast={showToast} />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              {toast && <Toast message={toast} />}
            </CollectionProvider>
          </SessionProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
