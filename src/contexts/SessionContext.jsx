import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children, API_BASE }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSessions();
    } else {
      setSessions([]);
      setActiveSession(null);
      setMessages([]);
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chat/sessions`);
      setSessions(res.data);
      if (res.data.length > 0) {
        if (!activeSession) loadSession(res.data[0]);
      } else {
        createNewSession();
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

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
      console.error("Failed to load session", err);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await axios.post(`${API_BASE}/chat/sessions`, { title: "New Chat" });
      setSessions([res.data, ...sessions]);
      setActiveSession(res.data);
      setMessages([{ role: 'bot', text: 'Hello! I am Interview AI, your personal preparation assistant. Ask me anything!' }]);
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  const deleteSession = async (id) => {
    if(!window.confirm("Delete this chat?")) return;
    try {
      await axios.delete(`${API_BASE}/chat/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
      if (activeSession?.id === id) {
        const remaining = sessions.filter(s => s.id !== id);
        if (remaining.length > 0) {
          loadSession(remaining[0]);
        } else {
          setActiveSession(null);
          setMessages([]);
          createNewSession();
        }
      }
    } catch(err) {
      console.error("Failed to delete session", err);
    }
  };

  const updateSessionTitle = async (id, newTitle) => {
    try {
      await axios.put(`${API_BASE}/chat/sessions/${id}`, { title: newTitle });
      setSessions(sessions.map(s => s.id === id ? { ...s, title: newTitle } : s));
      if (activeSession?.id === id) {
        setActiveSession(prev => ({ ...prev, title: newTitle }));
      }
    } catch (err) {
      console.error("Failed to rename session", err);
    }
  };

  return (
    <SessionContext.Provider value={{
      sessions,
      activeSession,
      messages,
      setMessages,
      loading,
      setLoading,
      loadSession,
      createNewSession,
      deleteSession,
      updateSessionTitle,
      setSessions,
      setActiveSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};
