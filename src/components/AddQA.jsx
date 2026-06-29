import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

const AddQA = ({ API_BASE, refresh, showToast, setActiveTab }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/qa`, {
        question,
        answer
      });
      showToast(res.data.message);
      refresh();
      setQuestion('');
      setAnswer('');
      setActiveTab('collection');
    } catch (err) {
      console.error("Error adding Q&A:", err);
      showToast("Failed to add Q&A");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">Add Daily Interview Q&A</div>
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Question</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Explain the concept of RAG (Retrieval-Augmented Generation)?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Answer</label>
            <textarea 
              className="form-textarea" 
              placeholder="Write the comprehensive answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn" disabled={loading || !question.trim() || !answer.trim()}>
            <Send size={18} />
            {loading ? "Processing (Checking Similarities)..." : "Save Q&A"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQA;
