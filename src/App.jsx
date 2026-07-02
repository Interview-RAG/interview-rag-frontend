import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { BookOpen, PlusCircle, MessageSquare, Download } from 'lucide-react';
import axios from 'axios';
import Collection from './components/Collection';
import AddQA from './components/AddQA';
import Chatbot from './components/Chatbot';

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8000/api' 
  : 'https://interview-rag-backend.onrender.com/api';

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
    <BrowserRouter>
      <div className="app-container">
        <div className="sidebar">
          <div className="brand">
            <BookOpen size={28} color="#58a6ff" />
            InterviewRAG
          </div>
          
          <NavLink 
            to="/collection"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <BookOpen size={20} />
            Collection
          </NavLink>
          
          <NavLink 
            to="/add"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <PlusCircle size={20} />
            Add Q&A
          </NavLink>
          
          <NavLink 
            to="/chat"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <MessageSquare size={20} />
            Interview AI
          </NavLink>

          <div style={{ marginTop: 'auto' }}>
            <div className="nav-item" onClick={handleDownloadPDF}>
              <Download size={20} />
              Export PDF
            </div>
          </div>
        </div>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/collection" replace />} />
            <Route path="/collection" element={<Collection API_BASE={API_BASE} showToast={showToast} />} />
            <Route path="/add" element={<AddQA API_BASE={API_BASE} showToast={showToast} />} />
            <Route path="/chat" element={<Chatbot API_BASE={API_BASE} />} />
          </Routes>
        </div>

        {toast && (
          <div className="toast">
            {toast}
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
