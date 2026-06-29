import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';

const Chatbot = ({ API_BASE }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your interview preparation assistant. Ask me anything about your saved collection.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, { query: userMessage });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="page-title">RAG Chatbot</div>
      
      <div className="glass-panel chat-history">
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role}`} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {msg.role === 'bot' ? <Bot size={24} color="var(--accent-color)" /> : <User size={24} color="#fff" />}
              </div>
              <div style={{ flex: 1 }}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg bot" style={{ display: 'flex', gap: '12px' }}>
              <Bot size={24} color="var(--accent-color)" />
              <div className="typing-indicator">Thinking...</div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
        
        <div style={{ padding: '24px', borderTop: '1px solid var(--panel-border)' }}>
          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask a question..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
