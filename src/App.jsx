import { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, MessageSquare, Download } from 'lucide-react';
import axios from 'axios';
import Collection from './components/Collection';
import AddQA from './components/AddQA';
import Chatbot from './components/Chatbot';

// const API_BASE = 'http://localhost:8000/api'; // Local dev
const API_BASE = 'https://interview-rag-backend.onrender.com/api'; // Prod

function App() {
  const [activeTab, setActiveTab] = useState('collection');
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchCollection = async () => {
    try {
      const res = await axios.get(`${API_BASE}/qa`);
      setCollection(res.data);
    } catch (err) {
      console.error("Failed to fetch collection:", err);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, []);

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
    <div className="app-container">
      <div className="sidebar">
        <div className="brand">
          <BookOpen size={28} color="#58a6ff" />
          InterviewRAG
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          <BookOpen size={20} />
          Collection
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <PlusCircle size={20} />
          Add Q&A
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={20} />
          Chatbot
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={handleDownloadPDF}>
            <Download size={20} />
            Export PDF
          </div>
        </div>
      </div>

      <div className="main-content">
        {activeTab === 'collection' && <Collection collection={collection} refresh={fetchCollection} />}
        {activeTab === 'add' && <AddQA API_BASE={API_BASE} refresh={fetchCollection} showToast={showToast} setActiveTab={setActiveTab} />}
        {activeTab === 'chat' && <Chatbot API_BASE={API_BASE} />}
      </div>

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
