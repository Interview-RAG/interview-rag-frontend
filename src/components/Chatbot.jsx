import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Plus, MessageSquare, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const Chatbot = ({ API_BASE }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const endOfMessagesRef = useRef(null);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chat/sessions`);
      setSessions(res.data);
      if (res.data.length > 0 && !activeSession) {
        loadSession(res.data[0]);
      } else if (res.data.length === 0) {
        createNewSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const loadSession = async (session) => {
    setActiveSession(session);
    try {
      const res = await axios.get(`${API_BASE}/chat/sessions/${session.id}/messages`);
      const formatted = res.data.map(m => ({ role: m.role === 'user' ? 'user' : 'bot', text: m.content }));
      if (formatted.length === 0) {
        formatted.push({ role: 'bot', text: 'Hello! I am your interview preparation assistant with memory. Ask me anything!' });
      }
      setMessages(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await axios.post(`${API_BASE}/chat/sessions`, { title: "New Chat" });
      setSessions([res.data, ...sessions]);
      setActiveSession(res.data);
      setMessages([{ role: 'bot', text: 'Hello! I am your interview preparation assistant with memory. Ask me anything!' }]);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if(!window.confirm("Delete this chat?")) return;
    try {
      await axios.delete(`${API_BASE}/chat/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMessages([]);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const startEdit = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${API_BASE}/chat/sessions/${id}`, { title: editTitle });
      setSessions(sessions.map(s => s.id === id ? { ...s, title: editTitle } : s));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, { query: userMessage, session_id: activeSession.id });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-layout" style={{ display: 'flex', height: '100%', gap: '20px' }}>
      
      {/* Sidebar for Sessions */}
      <div className="glass-panel" style={{ width: '250px', display: 'flex', flexDirection: 'column', padding: '15px' }}>
        <button className="btn" onClick={createNewSession} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
          <Plus size={18} /> New Chat
        </button>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.map(session => (
            <div 
              key={session.id} 
              className={`session-item ${activeSession?.id === session.id ? 'active' : ''}`}
              onClick={() => loadSession(session)}
              style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: activeSession?.id === session.id ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              {editingId === session.id ? (
                <input 
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => saveEdit(session.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(session.id)}
                  style={{ width: '100%', background: 'transparent', color: '#fff', border: '1px solid var(--accent-color)', borderRadius: '4px', padding: '2px 5px' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <MessageSquare size={16} color="var(--text-secondary)" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px' }}>
                    {session.title}
                  </span>
                </div>
              )}
              
              <div style={{ position: 'relative' }}>
                <MoreVertical 
                  size={16} 
                  color="var(--text-secondary)" 
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session.id ? null : session.id); }} 
                />
                {menuOpenId === session.id && (
                  <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '20px', zIndex: 10, padding: '5px', minWidth: '100px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div onClick={(e) => startEdit(session, e)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px', cursor: 'pointer', fontSize: '12px' }}><Edit2 size={12}/> Rename</div>
                    <div onClick={(e) => deleteSession(session.id, e)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px', cursor: 'pointer', fontSize: '12px', color: '#ff4444' }}><Trash2 size={12}/> Delete</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="glass-panel chat-history" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role}`} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {msg.role === 'bot' ? <Bot size={24} color="var(--accent-color)" /> : <User size={24} color="#fff" />}
              </div>
              <div style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{msg.text}</div>
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
              disabled={loading || !activeSession}
            />
            <button type="submit" className="btn" disabled={loading || !input.trim() || !activeSession}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
