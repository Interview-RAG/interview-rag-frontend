import React, { useState } from 'react';
import axios from 'axios';
import { Send, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddQA = ({ API_BASE, showToast }) => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  
  // PDF Upload State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Smart Generation State
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    
    setPdfLoading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);
    
    try {
      const res = await axios.post(`${API_BASE}/qa/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message);
      if (res.data.added > 0) {
        navigate('/collection');
      }
      setPdfFile(null);
      // reset file input
      document.getElementById('pdf-upload-input').value = '';
    } catch (err) {
      console.error("Error uploading PDF:", err);
      showToast(err.response?.data?.detail || "Failed to upload file");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleGenerateAnswer = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(`${API_BASE}/qa/generate-answer`, { question });
      setGeneratedAnswer(res.data.answer);
      setShowGenerateModal(true);
    } catch (err) {
      console.error("Error generating answer:", err);
      showToast(err.response?.data?.detail || "Failed to generate answer");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
        showToast("Please add a question.");
        return;
    }
    
    if (!answer.trim()) {
        handleGenerateAnswer();
        return;
    }

    saveQA(question, answer);
  };

  const saveQA = async (q, a) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/qa`, {
        question: q,
        answer: a
      });
      showToast(res.data.message);
      setQuestion('');
      setAnswer('');
      setShowGenerateModal(false);
      setGeneratedAnswer('');
      navigate('/collection');
    } catch (err) {
      console.error("Error adding Q&A:", err);
      showToast(err.response?.data?.detail || "Failed to add Q&A");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">Add Daily Interview Q&A</div>
      
      {/* Upload Section */}
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text-primary)' }}>Bulk Upload (PDF & Images)</h3>
        <form onSubmit={handlePdfUpload} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            id="pdf-upload-input"
            type="file" 
            accept="application/pdf, image/png, image/jpeg, image/webp"
            onChange={(e) => setPdfFile(e.target.files[0])}
            disabled={pdfLoading}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn" disabled={!pdfFile || pdfLoading}>
            <Upload size={18} />
            {pdfLoading ? "Extracting..." : "Upload & Extract"}
          </button>
        </form>
      </div>

      {/* Manual Add Section */}
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text-primary)' }}>Manual Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Question</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Explain the concept of RAG (Retrieval-Augmented Generation)?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading || generating}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Answer (Leave blank to AI generate)</label>
            <textarea 
              className="form-textarea" 
              placeholder="Write the comprehensive answer here... or leave empty to automatically generate one!"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={loading || generating}
            />
          </div>
          
          <button type="submit" className="btn" disabled={loading || generating}>
            <Send size={18} />
            {loading ? "Processing..." : generating ? "Generating..." : "Submit Q&A"}
          </button>
        </form>
      </div>

      {/* Generation Modal */}
      {showGenerateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', padding: '32px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Generated Answer</h3>
            <div style={{ 
                maxHeight: '400px', overflowY: 'auto', marginBottom: '24px', 
                whiteSpace: 'pre-wrap', color: 'var(--text-secondary)',
                backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px'
            }}>
              {generatedAnswer}
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                className="btn" 
                style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--text-primary)' }} 
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn" 
                style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--text-primary)' }} 
                onClick={handleGenerateAnswer} 
                disabled={generating}
              >
                {generating ? "Retrying..." : "Retry"}
              </button>
              <button 
                type="button"
                className="btn" 
                onClick={() => saveQA(question, generatedAnswer)} 
                disabled={loading}
              >
                {loading ? "Saving..." : "Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddQA;
