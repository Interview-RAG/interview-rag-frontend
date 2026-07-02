import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Plus, MessageSquare, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const Chatbot = ({ API_BASE }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [approvalData, setApprovalData] = useState(null);
  
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
        formatted.push({ role: 'bot', text: 'Hello! I am Interview AI, your personal preparation assistant. Ask me anything!' });
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
      setMessages([{ role: 'bot', text: 'Hello! I am Interview AI, your personal preparation assistant. Ask me anything!' }]);
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

  const getToolDisplayName = (toolName) => {
    switch(toolName) {
      case 'search_knowledge_base': return 'Searching your saved Q&As...';
      case 'search_web': return 'Searching the internet...';
      case 'save_user_fact': return 'Updating your profile...';
      case 'save_qa_to_collection': return 'Drafting Q&A...';
      default: return 'Using tool...';
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);
    setCurrentTool(null);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: userMessage, session_id: activeSession.id })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split('\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              try {
                const data = JSON.parse(dataStr);
                
                if (data.type === 'session_title') {
                  setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, title: data.title } : s));
                  setActiveSession(prev => ({ ...prev, title: data.title }));
                } else if (data.type === 'tool_start') {
                  setCurrentTool(getToolDisplayName(data.name));
                } else if (data.type === 'tool_end') {
                  setCurrentTool(null);
                } else if (data.type === 'requires_approval') {
                  setMessages(prev => [...prev, { role: 'bot', text: data.answer_msg }]);
                  setApprovalData({
                      ...data,
                      approvals: data.approvals.map(a => ({ ...a, approved: true }))
                  });
                } else if (data.type === 'final_answer') {
                  setMessages(prev => [...prev, { role: 'bot', text: data.content }]);
                } else if (data.type === 'error') {
                  setMessages(prev => [...prev, { role: 'bot', text: data.message }]);
                }
              } catch (e) {
                console.error("Error parsing JSON from stream:", e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setLoading(false);
      setCurrentTool(null);
    }
  };

  const handleApproveSave = async () => {
    if (!approvalData) return;
    setLoading(true);
    
    // Map the items to what the backend expects
    const dataToSend = {
      session_id: activeSession.id,
      approvals: approvalData.approvals.map(item => ({
          tool_call_id: item.tool_call_id,
          question: item.question,
          answer: item.answer,
          approved: item.approved
      }))
    };
    
    setApprovalData(null);
    try {
      const res = await axios.post(`${API_BASE}/chat/approve-save`, dataToSend);
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Error processing approval.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-layout" style={{ display: 'flex', height: '100%', gap: '20px', position: 'relative' }}>
      
      {/* Approval Modal */}
      {approvalData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ width: '800px', maxWidth: '95%', maxHeight: '90vh', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', flexShrink: 0 }}>Review {approvalData.approvals.length} Q&A Pairs Before Saving</h3>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '10px' }}>
                {approvalData.approvals.map((item, index) => (
                    <div key={item.tool_call_id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                <input 
                                    type="checkbox" 
                                    checked={item.approved} 
                                    onChange={(e) => {
                                        const newData = {...approvalData};
                                        newData.approvals[index].approved = e.target.checked;
                                        setApprovalData(newData);
                                    }}
                                />
                                Approve and Save this Item
                            </label>
                        </div>
                        
                        <div style={{ opacity: item.approved ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Question</label>
                              <textarea 
                                className="form-input" 
                                style={{ width: '100%', height: '60px', resize: 'vertical' }}
                                value={item.question}
                                disabled={!item.approved}
                                onChange={(e) => {
                                    const newData = {...approvalData};
                                    newData.approvals[index].question = e.target.value;
                                    setApprovalData(newData);
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Drafted Answer</label>
                              <textarea 
                                className="form-input" 
                                style={{ width: '100%', height: '150px', resize: 'vertical' }}
                                value={item.answer}
                                disabled={!item.approved}
                                onChange={(e) => {
                                    const newData = {...approvalData};
                                    newData.approvals[index].answer = e.target.value;
                                    setApprovalData(newData);
                                }}
                              />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px', flexShrink: 0, borderTop: '1px solid var(--panel-border)', paddingTop: '15px' }}>
              <button className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--panel-border)' }} onClick={() => setApprovalData(null)}>
                Cancel
              </button>
              <button className="btn" onClick={handleApproveSave}>
                Submit Approvals
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div style={{ flex: 1, whiteSpace: msg.role === 'bot' ? 'normal' : 'pre-wrap', lineHeight: '1.5' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                  {msg.role === 'bot' ? 'Interview AI' : 'You'}
                </div>
                {msg.role === 'bot' ? (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg bot" style={{ display: 'flex', gap: '12px' }}>
              <Bot size={24} color="var(--accent-color)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>Interview AI</div>
                <div className="typing-indicator">{currentTool || "Thinking..."}</div>
              </div>
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
