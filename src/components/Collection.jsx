import React from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const Collection = ({ collection, refresh, API_BASE, showToast }) => {
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Q&A?")) return;
    try {
      await axios.delete(`${API_BASE}/qa/${id}`);
      if (showToast) showToast("Deleted successfully");
      refresh();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Error deleting Q&A");
    }
  };
  return (
    <div>
      <div className="page-title">Interview Collection</div>
      
      {collection.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
          No questions in your collection yet. Start adding some!
        </div>
      ) : (
        collection.map((qa) => (
          <div key={qa.id} className="glass-panel qa-card">
            <div className="question-list">
              {qa.questions.map((q, idx) => (
                <div key={idx} className="question-item">
                  Q{idx + 1}: {q}
                </div>
              ))}
            </div>
            <div className="answer-text">
              {qa.answer}
            </div>
            <button 
              className="delete-btn" 
              onClick={() => handleDelete(qa.id)}
              style={{ marginTop: '15px', backgroundColor: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Collection;
