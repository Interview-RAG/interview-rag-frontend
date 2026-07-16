import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Collection from './components/Collection';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';
import Sidebar from './components/Sidebar';
import AddDrawer from './components/AddDrawer';

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8000/api' 
  : 'https://interview-rag-backend.onrender.com/api';

// Set up Axios Interceptor to add Auth Token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const bodyFont = { fontFamily: "'Public Sans', sans-serif" };

function AppShell({ showToast, API_BASE }) {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDownloadPDF = async () => {
    try {
      showToast("Generating PDF...");
      const res = await axios.get(`${API_BASE}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'PrepAI_Collection.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast("Download Complete");
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Download Failed");
    }
  };

  return (
    <div style={bodyFont} className="h-screen w-full flex bg-[#FAFAF8]">
      <Sidebar 
        onAddClick={() => setDrawerOpen(true)} 
        handleDownloadPDF={handleDownloadPDF} 
        API_BASE={API_BASE}
      />

      <main className="flex-1 min-w-0 bg-[#FAFAF8]">
        <Routes>
          <Route path="/collection" element={<Collection API_BASE={API_BASE} showToast={showToast} refreshKey={refreshKey} onAddClick={() => setDrawerOpen(true)} />} />
          <Route path="/chat" element={<Chatbot API_BASE={API_BASE} showToast={showToast} />} />
          <Route path="*" element={<Navigate to="/collection" replace />} />
        </Routes>
      </main>

      {user && (
        <AddDrawer 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)} 
          API_BASE={API_BASE}
          showToast={showToast}
          onAdded={() => setRefreshKey(prev => prev + 1)}
        />
      )}
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
    <AuthProvider>
      <BrowserRouter>
        <SessionProvider API_BASE={API_BASE}>
          <Routes>
            <Route path="/login" element={<Login showToast={showToast} />} />
            <Route path="/signup" element={<Signup showToast={showToast} />} />
            
            <Route path="/*" element={
              <ProtectedRoute>
                <AppShell showToast={showToast} API_BASE={API_BASE} />
              </ProtectedRoute>
            } />
          </Routes>
          {toast && (
            <div className="fixed bottom-6 right-6 bg-[#1F6E4A] text-white px-6 py-4 rounded-[12px] shadow-lg z-[100] animate-[slideUp_0.3s_ease_forwards]">
              {toast}
            </div>
          )}
        </SessionProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
