import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle, MessageSquare, Download, LogOut, UserMinus } from 'lucide-react';
import axios from 'axios';
import Collection from './components/Collection';
import AddQA from './components/AddQA';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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

// Sidebar component extracted to use AuthContext
const Sidebar = ({ handleDownloadPDF }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // Don't show sidebar if not logged in

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_BASE}/user`);
        await signOut();
        navigate('/login');
      } catch (err) {
        console.error("Failed to delete account", err);
        alert("Failed to delete account. Please try again.");
      }
    }
  };


  return (
    <div className="sidebar">
      <div className="brand">
        <BookOpen size={28} color="#58a6ff" />
        InterviewRAG
      </div>
      
      <NavLink to="/collection" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BookOpen size={20} />
        Collection
      </NavLink>
      
      <NavLink to="/add" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <PlusCircle size={20} />
        Add Q&A
      </NavLink>
      
      <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MessageSquare size={20} />
        Interview AI
      </NavLink>

      <div style={{ marginTop: 'auto' }}>
        <div className="nav-item" onClick={handleDownloadPDF}>
          <Download size={20} />
          Export PDF
        </div>
        <div className="nav-item" onClick={handleLogout} style={{ marginTop: '10px', color: '#f85149' }}>
          <LogOut size={20} />
          Logout
        </div>
        <div className="nav-item" onClick={handleDeleteAccount} style={{ marginTop: '10px', color: '#ff8888', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
          <UserMinus size={20} />
          Delete Account
        </div>
      </div>
    </div>
  );
};

function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadPDF = async () => {
    try {
      showToast("Generating PDF...");
      const res = await axios.get(`${API_BASE}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Interview_Collection.pdf');
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
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Sidebar handleDownloadPDF={handleDownloadPDF} />

          <div className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login showToast={showToast} />} />
              <Route path="/signup" element={<Signup showToast={showToast} />} />
              
              {/* Protected Routes */}
              <Route path="/collection" element={<ProtectedRoute><Collection API_BASE={API_BASE} showToast={showToast} /></ProtectedRoute>} />
              <Route path="/add" element={<ProtectedRoute><AddQA API_BASE={API_BASE} showToast={showToast} /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chatbot API_BASE={API_BASE} /></ProtectedRoute>} />
              
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/collection" replace />} />
            </Routes>
          </div>

          {toast && (
            <div className="toast">
              {toast}
            </div>
          )}
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
