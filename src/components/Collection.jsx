import React from 'react';

const Collection = ({ collection, refresh }) => {
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
          </div>
        ))
      )}
    </div>
  );
};

export default Collection;
