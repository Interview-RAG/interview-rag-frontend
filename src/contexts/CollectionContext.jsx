import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CollectionContext = createContext(null);

export const useCollection = () => useContext(CollectionContext);

const today = () => new Date().toISOString().slice(0, 10);

export const CollectionProvider = ({ children, API_BASE, showToast }) => {
  const { user } = useAuth();
  const [qas, setQas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [progress, setProgress] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/qa`);
      setQas(res.data);
    } catch (err) {
      console.error('Failed to load collection', err);
      showToast?.('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, showToast]);

  // Streaks and the review history live behind /progress. The sidebar and the
  // Progress screen both read this, so it is fetched once here.
  const refreshProgress = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/progress`);
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to load progress', err);
    }
  }, [API_BASE]);

  useEffect(() => {
    if (user) {
      refresh();
      refreshProgress();
    } else {
      setQas([]);
      setViewing(null);
      setProgress(null);
      setLoading(false);
    }
  }, [user, refresh, refreshProgress]);

  const deleteQA = useCallback(async (id) => {
    if (!window.confirm('Delete this Q&A?')) return;
    try {
      await axios.delete(`${API_BASE}/qa/${id}`);
      setQas((prev) => prev.filter((qa) => qa.id !== id));
      setViewing((v) => (v?.id === id ? null : v));
      showToast?.('Q&A deleted');
    } catch (err) {
      console.error(err);
      showToast?.('Failed to delete Q&A');
    }
  }, [API_BASE, showToast]);

  const updateTags = useCallback(async (id, tags) => {
    try {
      const res = await axios.patch(`${API_BASE}/qa/${id}/tags`, { tags });
      setQas((prev) => prev.map((qa) => (qa.id === id ? { ...qa, tags: res.data.tags } : qa)));
      setViewing((v) => (v?.id === id ? { ...v, tags: res.data.tags } : v));
    } catch (err) {
      console.error(err);
      showToast?.('Failed to update tags');
    }
  }, [API_BASE, showToast]);

  /** Rate a card. Returns the new interval so Practice can report it. */
  const rateCard = useCallback(async (id, ease, { mode = 'flip', score } = {}) => {
    const res = await axios.post(`${API_BASE}/practice/${id}/review`, { ease, mode, score });
    setQas((prev) => prev.map((qa) => (qa.id === id ? { ...qa, ...res.data.qa } : qa)));
    return res.data;
  }, [API_BASE]);

  const gradeAnswer = useCallback(async (id, typedAnswer) => {
    const res = await axios.post(`${API_BASE}/practice/${id}/grade`, { typed_answer: typedAnswer });
    return res.data;
  }, [API_BASE]);

  const due = useMemo(() => {
    const cutoff = today();
    return qas
      .filter((qa) => !qa.due_date || qa.due_date <= cutoff)
      .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
  }, [qas]);

  const allTags = useMemo(() => {
    const counts = new Map();
    qas.forEach((qa) => (qa.tags || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, [qas]);

  const value = {
    qas, loading, refresh,
    progress, refreshProgress,
    viewing, setViewing,
    deleteQA, updateTags, rateCard, gradeAnswer,
    due, dueCount: due.length, allTags,
  };

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
};
